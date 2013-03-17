'use strict';
var view    = require('koboldmaki'),
    pflock  = require('pflock'),
    each    = require('each'),

    defaults = {
        plugins: [
            require('./plugins/remove')
        ]
    };

module.exports = function ContentElement (options) {
    var binding,
        plugins = defaults.plugins || options.plugins,

        instance = {
            el: options.el,

            initialize: function () {
                instance.initializePlugins();
                instance.el.contentElementId = instance.getId();

                options.storage.get(instance.getId(), function (notification) {

                    if (notification.action === 'error') {
                        if (notification.error === 'not-found') {
                            instance.unload();
                            return;
                        }
                        throw new Error('failed to fetch content for: ' + instance.getId());
                    }
                    instance.render(notification.data);
                    return instance.update;
                });
            },

            update: function (notification) {
                if (notification.action === 'change') {
                    binding.toDocument(notification.data);
                    instance.initSubElements();
                }
                instance.emit(notification.action, notification.data);
            },

            unload: function () {
                instance.el.parent.removeChild(instance.el);
            },

            initializePlugins: function () {
                each(plugins, function (plugin) {
                    plugin(instance, options);
                });
            },

            initBinding: function (data) {
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

            render: function (data) {
                var template = instance.getTemplate();
                instance.el.innerHTML = template(data);
                instance.initBinding(data);
                instance.emit('rendered');
                instance.initSubElements();
            },

            initSubElements: function () {
                var subElements = instance.el.querySelectorAll('[x-template]');
                each(subElements, function (subelement) {

                    var subElementId = subelement.getAttribute('x-id');
                    if (subElementId !== subelement.contentElementId) {
                        instance.initSubElement(subelement);
                    }
                });
            },

            initSubElement: function (subelement) {
                var clone = subelement.cloneNode(true);
                subelement.parentNode.insertBefore(clone, subelement);
                subelement.parentNode.removeChild(subelement);
                subelement = clone;

                ContentElement({
                    el:        subelement,
                    storage:   options.storage,
                    templates: options.templates
                });
            }
        };

    return view(instance);
};