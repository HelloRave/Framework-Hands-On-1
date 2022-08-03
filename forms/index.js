const forms = require('forms')

const fields = forms.fields
const validators = forms.validators
const widgets = forms.widgets

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createProductForm = (mediaProperties, tags) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true
        }),
        'media_property_id': fields.string({
            label: 'Media Property',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: mediaProperties
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        }),
        'image_url': fields.string({
            widget: widgets.hidden()
        })
    })
}

const createUserForm = () => {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            validators: [validators.matchField('password')]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.string({
            required: true,
            errorAfterField: true 
        })
    })
}

const createSearchForm = (mediaProperties, tags) => {
    return forms.create({
        name: fields.string({
            required: false,
            errorAfterField: true
        }),
        min_cost: fields.number({
            required: false,
            errorAfterField: true,
            validators: [validators.integer()]
        }),
        max_cost: fields.number({
            required: false,
            errorAfterField: true,
            validators: [validators.integer()]
        }),
        media_property_id: fields.string({
            label: 'Media Property',
            required: false,
            errorAfterField: true,
            widget: widgets.select(),
            choices: mediaProperties
        }),
        tags: fields.string({
            required: false,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        })
    })
}

module.exports = {createProductForm, bootstrapField, createUserForm, createLoginForm, createSearchForm}