var each    = require('foreach'),
    event   = require('event'),
    toolbar = require('toolbar');

module.exports = function (instance, options) {

    function getIconPath (icon) {
        return "build/manuelstofer-content-element/resources/" + icon;
    }

    instance.on('rendered', function () {

        var icons = {};

        icons[getIconPath('remove.svg')] = function () {
            options.storage.del(instance.getId());
        };

        if (options.templates['edit/' + instance.doc.type + '.html']) {
            icons[getIconPath('edit.svg')] = function () {
                instance.emit('edit');
            };
        }

        toolbar(instance.el, {
            height: 20,
            position: 'right',
            icons: icons
        });
    });
};
