const express = require("express");
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const bcrypt = require("bcryptjs"); 
const session = require("express-session"); 

const Filme = require("../models/Filme");
const Usuario = require("../models/Usuario");
const ensureAuthenticated = require('../middleware/auth');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

router.use(session({
    secret: '17052008',
    resave: false,
    saveUninitialized: true
}));

router.get("/", async (req, res) => {
  res.render("main");
});

router.get('/cadastrar', (req, res) => {
  res.render('cadastrar'); 
});

router.post('/cadastrar', async (req, res) => {
  try {
      const { nome, email, senha, data_nascimento } = req.body;
      const usuarioExistente = await Usuario.findOne({ where: { email } });

      if (usuarioExistente) {
          req.flash('error_msg', 'Este e-mail já está cadastrado. Por favor, use outro e-mail.');
          return res.redirect('/cadastrar'); 
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = await Usuario.create({
          nome,
          email,
          senha: senhaHash, 
          data_nascimento
      });
      
      res.redirect('/login');
      req.flash('sucess_msg',"Usuário cadastrado com sucesso.");
  } catch (error) {
      console.error("Erro ao cadastrar usuário: ", error);
      req.flash('error_msg',"Erro ao cadastrar usuário.");
  }
});

router.get('/login', (req, res) => {
  res.render("login"); 
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            req.flash('error_msg', 'Usuário não encontrado!');
            return res.redirect('/login');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            req.flash('error_msg', 'Senha incorreta!');
            return res.redirect('/login');
        }

        req.session.usuarioId = usuario.id;
        req.flash('success_msg', 'Login realizado com sucesso!');
        res.redirect('/logado'); 
    } catch (error) {
        console.error("Erro ao tentar fazer login:", error);
        req.flash('error_msg', 'Erro ao tentar fazer login.');
        res.redirect('/login');
    }
});

router.get('/logado', (req, res) => {
  res.render("logado"); 
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('Erro ao destruir a sessão:', err);
          return res.redirect('/perfil');  
      }
      res.redirect('/login');  
  });
});

router.get('/perfil', ensureAuthenticated, async (req, res) => {
  try {
      const usuario = await Usuario.findByPk(req.session.usuarioId);

      if (!usuario) {
          req.flash('error_msg', 'Usuário não encontrado.');
          return res.redirect('/login');
      }

      console.log(usuario.dataValues);  
      res.render('perfil', { usuario: usuario.dataValues });  
  } catch (error) {
      console.error('Erro ao carregar o perfil:', error);
      req.flash('error_msg', 'Erro ao carregar o perfil.');
      res.redirect('/login');
  }
});

router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ raw: true }); 
    res.render('usuarios', { usuarios }); 
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    req.flash('error_msg', 'Erro ao carregar a lista de usuários.');
    res.redirect('/');
  }
});


router.get('/atualizar_usuario', ensureAuthenticated, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.session.usuarioId);
    if (!usuario) {
      req.flash('error_msg', 'Usuário não encontrado.');
      return res.redirect('/login');
    }
    res.render('atualizar_usuario', { usuario: usuario.dataValues });
  } catch (error) {
    console.error('Erro ao carregar os dados do usuário:', error);
    req.flash('error_msg', 'Erro ao carregar os dados do usuário.');
    res.redirect('/perfil');
  }
});

router.post('/atualizar_usuario', ensureAuthenticated, async (req, res) => {
  const { nome, email, senha_atual, senha_nova, data_nascimento } = req.body;

  try {
    const usuario = await Usuario.findByPk(req.session.usuarioId);
    if (!usuario) {
      req.flash('error_msg', 'Usuário não encontrado.');
      return res.redirect('/login');
    }

    const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);
    if (!senhaCorreta) {
      req.flash('error_msg', 'Senha atual incorreta.');
      return res.redirect('/atualizar_usuario');
    }

    if (senha_nova) {
      const senhaHash = await bcrypt.hash(senha_nova, 10);
      usuario.senha = senhaHash;
    }

    usuario.nome = nome || usuario.nome;
    usuario.email = email || usuario.email;
    usuario.data_nascimento = data_nascimento || usuario.data_nascimento;

    await usuario.save();

    req.flash('success_msg', 'Dados atualizados com sucesso!');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Erro ao atualizar os dados do usuário:', error);
    req.flash('error_msg', 'Erro ao atualizar os dados do usuário.');
    res.redirect('/atualizar_usuario');
  }
});


router.get('/deletar_usuario', (req, res) =>{
   res.render("deletar_usuario");
});

router.post('/deletar_usuario', async (req, res) => {
  try {
      const { email, senha } = req.body;
      const usuario = await Usuario.findOne({ where: { email } });

      if (!usuario) {
          req.flash('error_msg','Usuário não encontrado' );
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
          req.flash('error_msg', 'Senha inválida');
      }

      await usuario.destroy();
      req.flash('success_msg', 'Conta deletada com sucesso');

  } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      req.flash('error_msg', 'Erro interno do servidor');
  }
});

router.get('/adicionar_filmes', (req, res) => {
  res.render("adicionar_filmes"); 
});

router.post('/adicionar_filmes', upload.single('foto'), async(req, res) => {
  const {titulo, duracao, classificacao, genero, data_lancamento} = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}`:null;

  try{
    await Filme.create({titulo, duracao, classificacao, genero, data_lancamento, foto});
    req.flash('success_msg', 'Filme adicionado ao banco de dados com sucesso!');
    res.redirect('/filmes');
  }catch(error){
    req.flash('error_msg', 'Erro ao adicionar o filme: ' + error.message);
    res.redirect('/adicionar_filmes');
  }
});

router.get('/filmes', async (req, res) => {
  try {
    const filmes = await Filme.findAll(); 
    const filmesFormatados = filmes.map(filme => filme.get({ plain: true }));

    filmesFormatados.forEach(filme => {
      filme.data_lancamento_formatada = moment(filme.data_lancamento).format('DD/MM/YYYY');
    });

    let usuario = null;
    if (req.session.usuarioId) {
      usuario = await Usuario.findByPk(req.session.usuarioId, { raw: true });
    }
    
    res.render("filmes", { filmes: filmesFormatados, usuario});
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os filmes: ' + error.message);
    res.redirect('/');
  }
});

router.get('/atualizar_filmes', async (req, res) => {
  try {
    const filmes = await Filme.findAll({ attributes: ['titulo'] }); 
    const filmesFormatados = filmes.map(filme => ({ titulo: filme.titulo })); 

    res.render('atualizar_filmes', { filmes: filmesFormatados }); 
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os filmes: ' + error.message);
    res.redirect('/filmes');
  }
});


router.post('/atualizar_filmes', upload.single('foto'), async (req, res) => {
  const { titulo_atual, novo_titulo, duracao, classificacao, genero, data_lancamento } = req.body;
  console.log(req.body);

  if (!titulo_atual) {
    req.flash('error_msg', 'Por favor, selecione um filme para atualizar.');
    return res.redirect('/atualizar_filmes');
  }

  try {
    const filme = await Filme.findOne({ where: { titulo: titulo_atual } });

    if (!filme) {
      req.flash('error_msg', 'Filme não encontrado!');
      return res.redirect('/filmes');
    }

    filme.titulo = novo_titulo || filme.titulo; 
    filme.duracao = duracao || filme.duracao;
    filme.classificacao = classificacao || filme.classificacao;
    filme.genero = genero || filme.genero;
    filme.data_lancamento = data_lancamento || filme.data_lancamento;

    if (req.file) {
      filme.foto = `/uploads/${req.file.filename}`; 
    }

    await filme.save(); 

    req.flash('success_msg', 'Filme atualizado com sucesso!');
    res.redirect('/filmes'); 

  } catch (error) {
    req.flash('error_msg', 'Erro ao atualizar o filme: ' + error.message);
    res.redirect('/atualizar_filmes');
  }
});

router.get('/deletar_filme', async (req, res) => {
  try {
    const filmes = await Filme.findAll({ attributes: ['titulo'] }); 
    const filmesFormatados = filmes.map(filme => ({ titulo: filme.titulo })); 

    res.render('deletar_filme', { filmes: filmesFormatados }); 
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os filmes: ' + error.message);
    res.redirect('/filmes');
  }
});

router.post('/deletar_filme', async (req, res) => {
  const { titulo_atual } = req.body;  

  if (!titulo_atual) {
    req.flash('error_msg', 'Título do filme não informado.');
    return res.redirect('/filmes'); 
  }

  try {
    const filme = await Filme.findOne({ where: { titulo: titulo_atual } });

    if (!filme) {
      req.flash('error_msg', 'Filme não encontrado!');
      return res.redirect('/filmes'); 
    }

    await filme.destroy();  
    req.flash('success_msg', 'Filme excluído com sucesso!');
    res.redirect('/filmes'); 

  } catch (error) {
    req.flash('error_msg', 'Erro ao excluir o filme: ' + error.message);
    res.redirect('/filmes'); 
  }
});


module.exports = router;
