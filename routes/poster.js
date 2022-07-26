const express = require('express')
const { createProductForm, bootstrapField, createSearchForm } = require('../forms')
const { checkIfAuthenticated } = require('../middlewares/index')
const router = express.Router()

const {Product, MediaProperty, Tag} = require('../models')

router.get('/', async function(req, res){

    const mediaProperties = await MediaProperty.fetchAll().map(mediaProperty => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    mediaProperties.unshift([0, '-------'])

    const tags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')]
    })

    let searchForm = createSearchForm(mediaProperties, tags)
    let query = Product.collection()
    searchForm.handle(req, {
        empty: async function(form){
            let products = await query.fetch({
                withRelated: ['mediaProperty', 'tags']               
            })
            res.render('poster/browse',{
                products: products.toJSON(),
                form: form.toHTML(bootstrapField)
            })
        },
        error: async function(form){
            let products = await query.fetch({
                withRelated: ['mediaProperty', 'tags']               
            })
            res.render('poster/browse',{
                products: products.toJSON(),
                form: form.toHTML(bootstrapField)
            })
        },
        success: async function(form){

            if (form.data.name){
                query.where('name', 'like', `%${form.data.name}%`)
            }

            if (form.data.media_property_id && form.data.media_property_id != '0') {
                query.where('media_property_id', '=', form.data.media_property_id)
            }

            if (form.data.min_cost) {
                query.where('cost', '>=', form.data.min_cost)
            }

            if (form.data.max_cost) {
                query.where('cost', '<=', form.data.max_cost)
            }

            if (form.data.tags){
                query.query('join', 'products_tags', 'products.id', 'product_id')
                .where('tag_id', 'in', form.data.tags.split(','))
            }

            let products = await query.fetch({
                withRelated: ['mediaProperty', 'tags']               
            })
            res.render('poster/browse', {
                products: products.toJSON(),
                form: searchForm.toHTML(bootstrapField)
            })
        }
    })
    
})

router.get('/create', checkIfAuthenticated, async function(req, res){

    const mediaProperties = await MediaProperty.fetchAll().map(mediaProperty => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    const tags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')]
    })

    const productForm = createProductForm(mediaProperties.slice(1), tags);
    res.render('poster/create', {
        form: productForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async function(req, res){
    
    const mediaProperties = await MediaProperty.fetchAll().map(mediaProperty => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    const tags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')]
    })
    
    const productForm = createProductForm(mediaProperties.slice(1), tags);
    productForm.handle(req, {
        'success': async function(form){
            let {tags, ...productData} = form.data
            const product = new Product(productData);
            await product.save();
            if (tags) {
                await product.tags().attach(tags.split(','))
            }
            req.flash('success_messages', `New Product ${product.get('name')} has been created`)
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
    productForm.fields.image_url.value = product.get('image_url')

    let selectedTags = await product.related('tags').pluck('id')
    productForm.fields.tags.value = selectedTags

    res.render('poster/update', {
        form: productForm.toHTML(bootstrapField),
        product: product.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_PRESET
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