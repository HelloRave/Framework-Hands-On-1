const express = require('express')
const { createUserForm, bootstrapField } = require('../forms');
const { User } = require('../models');
const router = express.Router()

router.get('/register', function(req, res){
    const userForm = createUserForm();
    res.render('users/register', {
        form: userForm.toHTML(bootstrapField)
    })
})

router.post('/register', function(req, res){
    const userForm = createUserForm();
    userForm.handle(req, {
        success: async function(form){
            const user = new User();
            let {confirm_password, ...userData} = form.data
            user.set(userData)
            await user.save()
            req.flash('success_messages', 'User signed up successfully')
            res.redirect('/user/login')
        },
        error: function(form){
            res.render('users/register',{
                form: form.toHTML(bootstrapField)
            })
        },
        empty: function(form){
            res.render('users/register',{
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', function(req, res){
    res.render('users/login')
})

module.exports = router