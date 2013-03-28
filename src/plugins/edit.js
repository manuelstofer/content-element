var each = require('foreach'),
    event = require('event'),
    dialog = require('dialog');

module.exports = function (instance, options) {
    var ContentElement = require('../content-element');

    instance.on('edit', function () {

        var editEl = document.createElement('div');
        editEl.setAttribute('x-context', 'edit');
        ContentElement({
            el:         editEl,
            id:         instance.getId(),
            storage:    options.storage,
            templates:  options.templates
        });

        dialog(editEl).overlay().show();
    });
};
