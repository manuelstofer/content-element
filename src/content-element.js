'use strict';
var view    = require('koboldmaki'),
    pflock  = require('pflock'),
    each    = require('each'),
    toolbar = require('toolbar'),

    defaults = {
        plugins: [
            require('./plugins/x-remove'),
            require('./plugins/x-collection'),
            require('./plugins/edit'),
            require('./plugins/toolbar')
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
                    instance.data = notification.data;
                    instance.render(notification.data);
                    return instance.update;
                });

            },

            update: function (notification) {
                if (notification.action === 'change') {
                    binding.toDocument(notification.data);
                    instance.data = notification.data;
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

            getContext: function () {
                var el = instance.el;
                while (el.parentNode) {
                    var context = el.getAttribute('x-context');
                    if (context) {
                        return context;
                    }
                    el = el.parentNode;
                }
            },

            getTemplate: function () {
                var context = instance.getContext(),
                    templateName = instance.data.type + '.html',
                    contextTemplate = options.templates[context + '/' + templateName],
                    template = contextTemplate || options.templates[templateName];

                if (!template) {
                    throw new Error('No template found for type: ' + instance.data.type);
                }
                return template;
            },

            render: function (data) {
                var template = instance.getTemplate();
                instance.el.innerHTML = template(data);
                instance.emit('rendered');

                instance.initBinding(data);
                instance.emit('bound');

                instance.initSubElements();
                instance.emit('initialized');
            },

            initSubElements: function () {
                var subElements = instance.el.querySelectorAll('[x-id]');

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

                instance.emit('init-subelement', subelement);
            }
        };

    return view(instance);
};