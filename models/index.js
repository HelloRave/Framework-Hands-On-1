const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName: 'products',
    mediaProperty: function(){
        return this.belongsTo('MediaProperty')
    },
    tags: function(){
        return this.belongsToMany('Tag')
    }
})

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName: 'media_properties',
    products: function(){
        return this.hasMany('Product')
    }
})

const Tag = bookshelf.model('Tag', {
    tableName: 'tags',
    products: function(){
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User', {
    tableName: 'users'
})

module.exports = {Product, MediaProperty, Tag, User}