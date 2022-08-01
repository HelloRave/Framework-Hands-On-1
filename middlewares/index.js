const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash('error_messages', 'Sign in please')
        res.redirect('/user/login')
    }
}

module.exports = { checkIfAuthenticated }