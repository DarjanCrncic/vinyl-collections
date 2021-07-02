module.exports = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.isLoggedIn = false;
        return res.redirect('/login');
    }
    next();
}