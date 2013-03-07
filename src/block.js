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

            render: function () {
                instance.el.innerHTML = options.template(data);
                instance.emit('rendered');
                instance.initBinding();
            }
        };

    return view(instance);
};