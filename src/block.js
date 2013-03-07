'use strict';
var view = require('koboldmaki'),
    pflock = require('pflock');

module.exports = function block (options) {
    var data = {},
        binding,
        instance = {

            initialize: function () {
                options.storage.get(options.id, instance.setContent);
            },

            setContent: function (err, received) {
                data = received;
                if (err) {
                    throw new Error('failed to fetch content for: ' + options.id);
                }
                instance.render();
            },

            initBinding: function () {
                binding = pflock(instance.el, data);
                binding.on('changed', function () {
                    options.storage.set(options.id, binding.data);
                });
            },

            getTemplate: function () {
                var templateName;
                if (options.template) {
                    if (typeof options.template === 'function') {
                        return options.template;
                    }
                    templateName = options.template;
                } else {
                    templateName = instance.el.getAttribute('x-template').value;
                }
                return options.templates[templateName];
            },

            render: function () {
                var template = instance.getTemplate();
                instance.el.innerHTML = template(data);
                instance.emit('rendered');
                instance.initBinding();
            }
        };

    return view(instance);
};