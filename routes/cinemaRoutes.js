const express = require("express");
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const bcrypt = require("bcryptjs"); 
const session = require("express-session"); 

const Filme = require("../models/Filme");
const Usuario = require("../models/Usuario");
const Cinema = require("../models/Cinema");
const Sala = require("../models/Sala");
const Sessao = require("../models/Sessao");
const ensureAuthenticated = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

router.use(session({
    secret: 'seuSegredoAqui',
    resave: false,
    saveUninitialized: true
}));

const upload = multer({ storage });

router.get("/", async (req, res) => {
  res.render("main");
});

router.get('/cadastrar', (req, res) => {
  res.render('cadastrar'); 
});

//Usuário
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

router.get('/logado', ensureAuthenticated, (req, res) => {
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

router.get('/usuario', async (req, res) => {
  try {
    const usuario = await Usuario.findAll();
    const usuarioFormatados = usuario.map(usuario => {
      const plainUsuario = usuario.get({ plain: true });
      plainUsuario.data_nascimento_formatada = moment(plainUsuario.data_nascimento).format('DD/MM/YYYY');
      plainUsuario.is_admin_text = plainUsuario.is_admin ? 'Sim' : 'Não';
      return plainUsuario;
    });

    res.render("usuario", { usuario: usuarioFormatados });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os Usuários: ' + error.message);
    res.redirect('/perfil');
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

router.get('/deletar_usuario', ensureAuthenticated,(req, res) =>{
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

//filmes
router.get('/adicionar_filmes', ensureAuthenticated,(req, res) => {
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

router.get('/filmes', ensureAuthenticated, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.session.usuarioId);

    if (!usuario) {
      req.flash('error_msg', 'Usuário não encontrado.');
      return res.redirect('/login');
    }

    const filmes = await Filme.findAll();
    const filmesFormatados = filmes.map(filme => filme.get({ plain: true }));

    filmesFormatados.forEach(filme => {
      filme.data_lancamento_formatada = moment(filme.data_lancamento).format('DD/MM/YYYY');
    });

    res.render("filmes", { filmes: filmesFormatados, usuario: usuario.dataValues });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os filmes: ' + error.message);
    res.redirect('/');
  }
});

router.get('/atualizar_filmes', ensureAuthenticated,async (req, res) => {
  try {
    const filmes = await Filme.findAll({ attributes: ['titulo'] }); 
    const filmesFormatados = filmes.map(filme => ({ titulo: filme.titulo })); 

    res.render('atualizar_filmes', { filmes: filmesFormatados }); 
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os filmes: ' + error.message);
    res.redirect('/filmes');
  }
});

router.post('/atualizar_filmes', async (req, res) => {
  const { titulo_atual, novo_titulo, duracao, classificacao, genero, data_lancamento } = req.body;
  console.log('Título Atual:', titulo_atual);  

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

router.get('/deletar_filme', ensureAuthenticated,async (req, res) => {
  try {
    const filmes = await Filme.findAll({ attributes: ['titulo'] }); // Busca apenas os títulos
    const filmesFormatados = filmes.map(filme => ({ titulo: filme.titulo })); // Formata os dados como objetos

    res.render('deletar_filme', { filmes: filmesFormatados }); // Passa os filmes formatados para o template
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os filmes: ' + error.message);
    res.redirect('/filmes');
  }
});

router.post('/deletar_filme',async (req, res) => {
  const { titulo_atual } = req.body;  // Captura o título do filme a ser deletado

  if (!titulo_atual) {
    req.flash('error_msg', 'Título do filme não informado.');
    return res.redirect('/filmes'); // Redireciona de volta para a lista de filmes
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
    res.redirect('/filmes'); // Redireciona em caso de erro
  }
});

//Cinemas
router.get('/adicionar_cinema', ensureAuthenticated, (req, res) => {
  res.render('adicionar_cinema');
});

router.post('/adicionar_cinema', async (req, res) => {
  const { nome, local, capacidade } = req.body;

  try {
    await Cinema.create({ nome, local, capacidade });
    req.flash('success_msg', 'Cinema adicionado com sucesso!');
    res.redirect('/cinemas');
  } catch (error) {
    req.flash('error_msg', 'Erro ao adicionar o cinema: ' + error.message);
    res.redirect('/adicionar_cinema');
  }
});

router.get('/cinemas', async (req, res) => {
  try {
    const cinemas = await Cinema.findAll();
    const cinemasFormatados = cinemas.map(cinema => cinema.get({ plain: true }));
    res.render('cinemas', { cinemas: cinemasFormatados });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os cinemas: ' + error.message);
    res.redirect('/perfil');
  }
});

router.get('/atualizar_cinema', ensureAuthenticated, async (req, res) => {
  try {
    const cinemas = await Cinema.findAll({ attributes: ['nome'] }); 
    const cinemasFormatados = cinemas.map(cinema => cinema.get({ plain: true })); 
    res.render('atualizar_cinema', { cinemas: cinemasFormatados }); 
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os cinemas: ' + error.message);
    res.redirect('/cinemas');
  }
});


router.post('/atualizar_cinema', async (req, res) => {
  const { nome_atual, novo_nome, local, capacidade } = req.body;

  if (!nome_atual) {
    req.flash('error_msg', 'Por favor, selecione um cinema para atualizar.');
    return res.redirect('/atualizar_cinema');
  }

  try {
    const cinema = await Cinema.findOne({ where: { nome: nome_atual } });

    if (!cinema) {
      req.flash('error_msg', 'Cinema não encontrado!');
      return res.redirect('/cinemas');
    }

    cinema.nome = novo_nome || cinema.nome;
    cinema.local = local || cinema.local;
    cinema.capacidade = capacidade || cinema.capacidade;

    await cinema.save();
    req.flash('success_msg', 'Cinema atualizado com sucesso!');
    res.redirect('/cinemas');
  } catch (error) {
    req.flash('error_msg', 'Erro ao atualizar o cinema: ' + error.message);
    res.redirect('/atualizar_cinema');
  }
});

router.get('/deletar_cinema', ensureAuthenticated, async (req, res) => {
  try {
    const cinemas = await Cinema.findAll({ attributes: ['nome'] });
    const cinemasFormatados = cinemas.map(cinema => ({ nome: cinema.nome }));
    res.render('deletar_cinema', { cinemas: cinemasFormatados });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os cinemas: ' + error.message);
    res.redirect('/cinemas');
  }
});

router.post('/deletar_cinema', async (req, res) => {
  const { nome_atual } = req.body;

  if (!nome_atual) {
    req.flash('error_msg', 'Nome do cinema não informado.');
    return res.redirect('/cinemas');
  }

  try {
    const cinema = await Cinema.findOne({ where: { nome: nome_atual } });

    if (!cinema) {
      req.flash('error_msg', 'Cinema não encontrado!');
      return res.redirect('/cinemas');
    }

    await cinema.destroy();
    req.flash('success_msg', 'Cinema excluído com sucesso!');
    res.redirect('/cinemas');
  } catch (error) {
    req.flash('error_msg', 'Erro ao excluir o cinema: ' + error.message);
    res.redirect('/cinemas');
  }
});

//Sala
router.get('/adicionar_sala', ensureAuthenticated, async (req, res) => {
  try {
    const cinemas = await Cinema.findAll({ attributes: ['id', 'nome'] }); 
    const cinemasFormatados = cinemas.map(cinema => cinema.get({ plain: true }));
    res.render('adicionar_sala', { cinemas: cinemasFormatados });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar os cinemas: ' + error.message);
    res.redirect('/cinemas');
  }
});

router.post('/adicionar_sala', async (req, res) => {
  const { numero, capacidade, cinema_id } = req.body;

  try {
    await Sala.create({ numero, capacidade, cinema_id });
    req.flash('success_msg', 'Sala adicionada com sucesso!');
    res.redirect('/salas');
  } catch (error) {
    req.flash('error_msg', 'Erro ao adicionar a sala: ' + error.message);
    res.redirect('/adicionar_sala');
  }
});

router.get('/salas', async (req, res) => {
  try {
    const salas = await Sala.findAll({
      include: { 
        model: Cinema, 
        attributes: ['nome']  
      }
    });

    const salasFormatadas = salas.map(sala => sala.get({ plain: true }));

    res.render('salas', { salas: salasFormatadas });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar as salas: ' + error.message);
    res.redirect('/perfil');
  }
});

router.get('/atualizar_sala', ensureAuthenticated, async (req, res) => {
  try {
    const salas = await Sala.findAll({ attributes: ['id', 'numero'] });
    const salasFormatadas = salas.map(sala => sala.get({ plain: true }));

    const cinemas = await Cinema.findAll({ attributes: ['id', 'nome'] });
    const cinemasFormatados = cinemas.map(cinema => cinema.get({ plain: true }));

    res.render('atualizar_sala', { salas: salasFormatadas, cinemas: cinemasFormatados });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar as salas: ' + error.message);
    res.redirect('/salas');
  }
});

router.post('/atualizar_sala', async (req, res) => {
  const { id_atual, numero, capacidade, cinema_id } = req.body;

  if (!id_atual) {
    req.flash('error_msg', 'Por favor, selecione uma sala para atualizar.');
    return res.redirect('/atualizar_sala');
  }

  try {
    const sala = await Sala.findOne({ where: { id: id_atual } });

    if (!sala) {
      req.flash('error_msg', 'Sala não encontrada!');
      return res.redirect('/salas');
    }

    sala.numero = numero || sala.numero;
    sala.capacidade = capacidade || sala.capacidade;
    sala.cinema_id = cinema_id || sala.cinema_id;

    await sala.save();
    req.flash('success_msg', 'Sala atualizada com sucesso!');
    res.redirect('/salas');
  } catch (error) {
    req.flash('error_msg', 'Erro ao atualizar a sala: ' + error.message);
    res.redirect('/atualizar_sala');
  }
});

router.get('/deletar_sala', ensureAuthenticated, async (req, res) => {
  try {
    const salas = await Sala.findAll({ attributes: ['id', 'numero'] });
    const salasFormatadas = salas.map(sala => ({ id: sala.id, numero: sala.numero }));
    res.render('deletar_sala', { salas: salasFormatadas });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar as salas: ' + error.message);
    res.redirect('/salas');
  }
});

router.post('/deletar_sala', async (req, res) => {
  const { id_atual } = req.body;

  if (!id_atual) {
    req.flash('error_msg', 'ID da sala não informado.');
    return res.redirect('/salas');
  }

  try {
    const sala = await Sala.findOne({ where: { id: id_atual } });

    if (!sala) {
      req.flash('error_msg', 'Sala não encontrada!');
      return res.redirect('/salas');
    }

    await sala.destroy();
    req.flash('success_msg', 'Sala excluída com sucesso!');
    res.redirect('/salas');
  } catch (error) {
    req.flash('error_msg', 'Erro ao excluir a sala: ' + error.message);
    res.redirect('/salas');
  }
});

//sessões
router.get('/adicionar_sessao', ensureAuthenticated, async (req, res) => {
  try {
    const filmes = await Filme.findAll({ attributes: ['id', 'titulo'] }); 
    const filmesFormatados = filmes.map(filme => filme.get({ plain: true }));

    const salas = await Sala.findAll({ attributes: ['id', 'numero'] });
    const salasFormatadas = salas.map(sala => sala.get({ plain: true }));

    res.render('adicionar_sessao', { filmes: filmesFormatados, salas: salasFormatadas });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar filmes e salas: ' + error.message);
    res.redirect('/filmes');
  }
});

router.post('/adicionar_sessao', async (req, res) => {
  const { filme_id, sala_id, horario, preco } = req.body;

  try {
    await Sessao.create({ filme_id, sala_id, horario, preco });
    req.flash('success_msg', 'Sessão adicionada com sucesso!');
    res.redirect('/sessoes');
  } catch (error) {
    req.flash('error_msg', 'Erro ao adicionar a sessão: ' + error.message);
    res.redirect('/adicionar_sessao');
  }
});

router.get('/sessoes', async (req, res) => {
  try {
    const sessoes = await Sessao.findAll({
      include: [
        { model: Filme, attributes: ['titulo'] },
        { model: Sala, attributes: ['numero'] }
      ]
    });

    const sessoesFormatadas = sessoes.map(sessao => {
      const sessaoData = sessao.get({ plain: true });
      sessaoData.horario = new Date(sessaoData.horario).toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return sessaoData;
    });

    res.render('sessoes', { sessoes: sessoesFormatadas });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar as sessões: ' + error.message);
    res.redirect('/perfil');
  }
});

router.get('/atualizar_sessao', ensureAuthenticated, async (req, res) => {
  try {
    const sessoes = await Sessao.findAll({ attributes: ['id', 'horario'] });
    const sessoesFormatadas = sessoes.map(sessao => sessao.get({ plain: true }));

    const filmes = await Filme.findAll({ attributes: ['id', 'titulo'] });
    const filmesFormatados = filmes.map(filme => filme.get({ plain: true }));

    const salas = await Sala.findAll({ attributes: ['id', 'numero'] });
    const salasFormatadas = salas.map(sala => sala.get({ plain: true }));

    res.render('atualizar_sessao', { sessoes: sessoesFormatadas, filmes: filmesFormatados, salas: salasFormatadas });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar as sessões, filmes ou salas: ' + error.message);
    res.redirect('/sessoes');
  }
});

router.post('/atualizar_sessao', async (req, res) => {
  const { id_atual, filme_id, sala_id, horario, preco } = req.body;

  if (!id_atual) {
    req.flash('error_msg', 'Por favor, selecione uma sessão para atualizar.');
    return res.redirect('/atualizar_sessao');
  }

  try {
    const sessao = await Sessao.findOne({ where: { id: id_atual } });

    if (!sessao) {
      req.flash('error_msg', 'Sessão não encontrada!');
      return res.redirect('/sessoes');
    }

    sessao.filme_id = filme_id || sessao.filme_id;
    sessao.sala_id = sala_id || sessao.sala_id;
    sessao.horario = horario || sessao.horario;
    sessao.preco = preco || sessao.preco;

    await sessao.save();
    req.flash('success_msg', 'Sessão atualizada com sucesso!');
    res.redirect('/sessoes');
  } catch (error) {
    req.flash('error_msg', 'Erro ao atualizar a sessão: ' + error.message);
    res.redirect('/atualizar_sessao');
  }
});

router.get('/deletar_sessao', ensureAuthenticated, async (req, res) => {
  try {
    const sessoes = await Sessao.findAll({ attributes: ['id', 'horario'] });
    const sessoesFormatadas = sessoes.map(sessao => ({ id: sessao.id, horario: sessao.horario }));
    res.render('deletar_sessao', { sessoes: sessoesFormatadas });
  } catch (error) {
    req.flash('error_msg', 'Erro ao carregar as sessões: ' + error.message);
    res.redirect('/sessoes');
  }
});

router.post('/deletar_sessao', async (req, res) => {
  const { id_atual } = req.body;

  if (!id_atual) {
    req.flash('error_msg', 'ID da sessão não informado.');
    return res.redirect('/sessoes');
  }

  try {
    const sessao = await Sessao.findOne({ where: { id: id_atual } });

    if (!sessao) {
      req.flash('error_msg', 'Sessão não encontrada!');
      return res.redirect('/sessoes');
    }

    await sessao.destroy();
    req.flash('success_msg', 'Sessão excluída com sucesso!');
    res.redirect('/sessoes');
  } catch (error) {
    req.flash('error_msg', 'Erro ao excluir a sessão: ' + error.message);
    res.redirect('/sessoes');
  }
});


module.exports = router;
