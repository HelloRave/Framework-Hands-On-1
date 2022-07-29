const express = require('express')
const { createProductForm, bootstrapField } = require('../forms')
const router = express.Router()

const {Product, MediaProperty, Tag} = require('../models')

router.get('/', async function(req, res){
    let products = await Product.collection().fetch({
        withRelated: ['mediaProperty', 'tags']
    })
    res.render('poster/browse', {
        products: products.toJSON()
    })
})

router.get('/create', async function(req, res){

    const mediaProperties = await MediaProperty.fetchAll().map(mediaProperty => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    const tags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')]
    })

    const productForm = createProductForm(mediaProperties.slice(1), tags);
    res.render('poster/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function(req, res){
    const productForm = createProductForm();
    productForm.handle(req, {
        success: async function(form){
            let {tags, ...productData} = form.data
            const product = new Product(productData);
            await product.save();
            if (tags) {
                await product.tags().attach(tags.split(','))
            }
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