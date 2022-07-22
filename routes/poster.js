const express = require('express')
const { createProductForm, bootstrapField } = require('../forms')
const router = express.Router()

const {Product} = require('../models')

router.get('/', async function(req, res){
    let products = await Product.collection().fetch()
    res.render('poster/browse', {
        products: products.toJSON()
    })
})

router.get('/create', async function(req, res){
    const productForm = createProductForm();
    res.render('poster/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function(req, res){
    const productForm = createProductForm();
    productForm.handle(req, {
        success: async function(form){
            const product = new Product();
            product.set('name', form.data.name)
            product.set('cost', form.data.cost)
            product.set('description', form.data.description);
            await product.save();
            res.redirect('/posters')
        },
        error: function(form){
            res.render('poster/create', {
                'form': form.toHTML(bootstrapField)
            })
        },
        empty: function(form){

        }
    })
})

module.exports = router