const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName: 'products',
    mediaProperty: function(){
        return this.belongsTo('MediaProperty')
    }
})

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName: 'media_properties',
    products: function(){
        return this.hasMany('Product')
    }
})

module.exports = {Product, MediaProperty}