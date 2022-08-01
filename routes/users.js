const express = require('express')
const { createUserForm, bootstrapField, createLoginForm } = require('../forms');
const { User } = require('../models');
const router = express.Router()
const crypto = require('crypto')

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256')
    const hash = sha256.update(password).digest('base64')
    return hash
}

router.get('/register', function (req, res) {
    const userForm = createUserForm();
    res.render('users/register', {
        form: userForm.toHTML(bootstrapField)
    })
})

router.post('/register', function (req, res) {
    const userForm = createUserForm();
    userForm.handle(req, {
        success: async function (form) {
            const user = new User({
                'username': form.data.username,
                'password': getHashedPassword(form.data.password),
                'email': form.data.email
            }); 
            await user.save()
            req.flash('success_messages', 'User signed up successfully')
            res.redirect('/user/login')
        },
        error: function (form) {
            res.render('users/register', {
                form: form.toHTML(bootstrapField)
            })
        },
        empty: function (form) {
            res.render('users/register', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', function (req, res) {
    let loginForm = createLoginForm()
    res.render('users/login', {
        form: loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', function (req, res) {
    let loginForm = createLoginForm()
    loginForm.handle(req, {
        success: async function (form) {
            let user = await User.where({
                email: form.data.email
            }).fetch({
                require: false
            })

            if (!user) {
                req.flash('error_messages', 'Sorry, does not match')
                res.redirect('/user/login')
            } else {
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    req.session.user = {
                        id: user.get('id'),
                        email: user.get('email'),
                        username: user.get('username')
                    }
                    req.flash('success_messages', `Welcome back ${user.get('username')}`)
                    res.redirect('/user/profile')
                } else {
                    req.flash('error_messages', 'Login failed')
                    res.redirect('/user/login')
                }
            }
        },
        error: function (form) {
            req.flash('error_messages', 'Please fill in form again')
            res.render('users/login', {
                form: form.toHTML(bootstrapField)
            })
        },
        empty: function (form) {
            req.flash('error_messages', 'Please fill in form again')
            res.render('users/login', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', function(req, res){
    const user = req.session.user
    if (!user){
        req.flash('error_messages', 'No permission to view this')
        res.redirect('/user/login')
    } else {
        res.render('users/profile', {
            user
        })
    }
})

router.get('/logout', function(req,res){
    req.session.user = null;
    req.flash('success_messages', 'Bye')
    res.redirect('/user/login')
})

module.exports = router