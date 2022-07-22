const express = require('express')
const hbs = require('hbs')
const wax = require('wax-on')
require('dotenv').config()

const app = express()

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

app.listen(3000, function(){
    console.log('Server started')
})