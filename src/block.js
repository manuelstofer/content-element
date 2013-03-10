'use strict';
var view    = require('koboldmaki'),
    pflock  = require('pflock'),
    each    = require('each');

module.exports = function block (options) {
    var data = {},
        binding,
        instance = {
            el: options.el,

            initialize: function () {
                options.storage.get(instance.getId(), function (notification) {
                    instance.setContent(notification);
                    return function (notification) {
                        binding.toDocument(notification.data);
                    };
                });
            },

            setContent: function (notification) {
                data = notification.data;
                if (notification.action == 'error') {
                    throw new Error('failed to fetch content for: ' + instance.getId());
                }
                instance.render();
            },

            initBinding: function () {
                binding = pflock(instance.el, data);
                binding.on('changed', function () {
                    options.storage.put(binding.data);
                });
            },

            getId: function () {
                return options.id || instance.el.getAttribute('x-id');
            },

            getTemplate: function () {
                var templateName;
                if (options.template) {
                    if (typeof options.template === 'function') {
                        return options.template;
                    }
                    templateName = options.template;
                } else {
                    templateName = instance.el.getAttribute('x-template');
                }
                return options.templates[templateName];
            },

            render: function () {
                var template = instance.getTemplate();
                instance.el.innerHTML = template(data);
                instance.emit('rendered');
                instance.initBinding();

                var subBlocks = instance.el.querySelectorAll('[x-template]');
                each(subBlocks, function (subBlock) {
                    block({
                        el:        subBlock,
                        storage:   options.storage,
                        templates: options.templates
                    });
                });

            }
        };

    return view(instance);
};