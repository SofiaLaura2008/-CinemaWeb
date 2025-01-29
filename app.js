const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const flash = require("connect-flash");

const Filme = require('./models/Filme');
const db = require("./config/database");
const cinemaRoutes = require("./routes/cinemaRoutes");

const app = express();

async function testarConexao() {
    try{
        await db.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso');
    }catch(error){
        console.error('Erro ao conectar: ', error);
    }
}

async function sincronizarBD() {
    try{
        await db.sync({force: false});
        console.log("Tabelas sicronizadas com sucesso");
    }catch(error){
        console.error("Erro ao sicronizar as tabelas", error);
    }
}

app.use(
    session({
        secret: "seuSegredoAqui", 
        resave: false,
        saveUninitialized: true,
    })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});

app.engine("handlebars", exphbs.engine({defaultLayout: false}));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "handlebars");

app.use(express.urlencoded({extended:true}));
app.use("/", cinemaRoutes);
app.use(express.static('public'));


async function inicializarServidor() {
    await testarConexao();
    await sincronizarBD();
}

app.listen(3000, () =>{
    console.log('servidor em execução')
})

inicializarServidor();