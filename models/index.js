const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName: 'products'
})

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName: 'media_properties'
})

module.exports = {Product, MediaProperty}