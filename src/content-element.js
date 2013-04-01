'use strict';
var view    = require('koboldmaki'),
    pflock  = require('pflock'),
    each    = require('foreach'),
    toolbar = require('toolbar'),

    defaults = {
        plugins: [
            require('./plugins/x-remove'),
            require('./plugins/x-query'),
            require('./plugins/x-collection'),
            require('./plugins/edit'),
            require('./plugins/toolbar')
        ]
    };

module.exports = function ContentElement (options) {
    var binding,
        plugins = defaults.plugins || options.plugins,

        initialized = false,
        deferred = 0,

        parent = options.parent,

        instance = {
            el: options.el,

            initialize: function () {
                instance.initializePlugins();
                instance.el.contentElementId = instance.getId();

                options.storage.get(instance.getId(), function (notification) {

                    if (notification.event === 'error') {

                        parent.once('initialized', function () {
                            var parent = instance.el.parentNode;
                            if (parent) {
                                parent.removeChild(instance.el);
                                triggerEvent(parent, 'read');
                            }
                        });

                        instance.emit('initialized');

                        console.log('failed to fetch content for: ' + instance.getId());
                        return;
                    }
                    instance.doc = notification.doc;
                    instance.render(notification.doc);
                    return instance.update;
                });

            },

            update: function (notification) {
                if (notification.event === 'change') {
                    binding.toDocument(notification.doc);
                    instance.doc = notification.doc;
                    instance.initSubElements();
                }
                instance.emit(notification.event, notification.doc);
            },

            unload: function () {
                instance.el.parentNode.removeChild(instance.el);
            },

            initializePlugins: function () {
                each(plugins, function (plugin) {
                    plugin(instance, options);
                });
            },

            initBinding: function (doc) {
                binding = pflock(instance.el, doc);
                binding.on('changed', function () {
                    options.storage.put(binding.data, function (not) {
                        instance.emit('saved');
                    });
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
                    templateName = instance.doc.type + '.html',
                    contextTemplate = options.templates[context + '/' + templateName],
                    template = contextTemplate || options.templates[templateName];

                if (!template) {
                    throw new Error('No template found for type: ' + instance.doc.type);
                }
                return template;
            },

            render: function (doc) {
                var template = instance.getTemplate();
                instance.el.innerHTML = template(doc);
                instance.emit('rendered');

                instance.initBinding(doc);
                instance.emit('bound');

                instance.initSubElements();
            },

            initSubElements: function () {
                var subElements = instance.el.querySelectorAll('[x-id]');
                each(subElements, instance.initSubElement);
                instance.checkReady();
            },

            checkReady: function () {
                if (deferred === 0 && !initialized) {
                    initialized = true;
                    instance.emit('initialized');
                }
            },

            deferInit: function () {
                deferred++;
            },

            progressInit: function () {
                deferred--;
                instance.checkReady();
            },

            initSubElement: function(subelement) {
                var subElementId = subelement.getAttribute('x-id');
                if (subElementId !== subelement.contentElementId) {

                    instance.deferInit();

                    var clone = subelement.cloneNode(true);
                    subelement.parentNode.insertBefore(clone, subelement);
                    subelement.parentNode.removeChild(subelement);
                    subelement = clone;

                    var subEl = ContentElement({
                        id:        subElementId,
                        el:        subelement,
                        storage:   options.storage,
                        templates: options.templates,
                        parent:    instance
                    });

                    subEl.on('initialized', instance.progressInit);
                }
            }
        };

    return view(instance);
};


function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}