const express = require('express')
const hbs = require('hbs')
const wax = require('wax-on')
const session = require('express-session')
const flash = require('connect-flash')
const FileStore = require('session-file-store')(session)
require('dotenv').config()

const app = express()

app.use(session({
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(flash())

app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    next()
})

const posterRoutes = require('./routes/poster')

app.set('view engine', 'hbs')

app.use(express.static('public'))

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts')

app.use(express.urlencoded({
    extended: false 
}))

app.use('/', require('./routes/landing'))
app.use('/posters', posterRoutes)
app.use('/user', require('./routes/users'))

app.listen(3000, function(){
    console.log('Server started')
})