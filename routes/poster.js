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
        'success': async function(form){
            let {tags, ...productData} = form.data
            const product = new Product(productData);
            await product.save();
            if (tags) {
                await product.tags().attach(tags.split(','))
            }
            res.redirect('/posters')
        },
        'error': function(form){
            res.render('poster/create', {
                'form': form.toHTML(bootstrapField)
            })
        },
        'empty': function(form){
            res.render('poster/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async function(req, res){
    const product = await Product.where({
        id: parseInt(req.params.product_id)
    }).fetch({
        require: true,
        withRelated: ['tags']
    })

    const mediaProperties = await MediaProperty.fetchAll().map(mediaProperty => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    const tags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')]
    })

    const productForm = createProductForm(mediaProperties.slice(1), tags);

    productForm.fields.name.value = product.get('name')
    productForm.fields.cost.value = product.get('cost')
    productForm.fields.description.value = product.get('description')
    productForm.fields.media_property_id.value = product.get('media_property_id')

    let selectedTags = await product.related('tags').pluck('id')
    productForm.fields.tags.value = selectedTags

    res.render('poster/update', {
        form: productForm.toHTML(bootstrapField),
        product: product.toJSON()
    })
})

router.post('/:product_id/update', async function(req, res){
    const product = await Product.where({
        id: req.params.product_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    })

    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async function(form){
            let {tags, ...productData} = form.data

            product.set(productData);
            product.save();

            let tagIds = tags.split(',')
            let allTagIds = await product.related('tags').pluck('id')
            // console.log(allTagIds) - empty array? 

            let toRemove = allTagIds.filter(tag => {
                return !tagIds.includes(tag)
            })

            await product.tags().detach(toRemove)
            await product.tags().attach(tagIds)
            
            res.redirect('/posters')
        },
        'error': function(form){
            res.render('poster/update', {
                form: form.toHTML(bootstrapField)
            })
        },
        'empty': function(form){
            res.render('poster/update', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/delete', function(req, res){
    res.send('delete')
})

module.exports = router