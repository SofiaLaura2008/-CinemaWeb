module.exports = function(req, res, next) {
    if (req.session.usuarioId) {  
        return next();  
    } else {
        req.flash('error_msg', 'Você precisa estar logado para acessar essa página.');
        res.redirect('/login');  
    }
  };
  