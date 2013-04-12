'use strict';

var each    = require('foreach'),
    event   = require('event'),
    trigger = require('trigger-event');

module.exports = Remove;

/**
 * Adds support for x-remove attribute
 *
 * @param view
 * @param clb
 */
function Remove (view, clb) {
    var nodes = view.el.querySelectorAll('[x-remove]');
    each(nodes, function (node) {
        event.bind(node, 'click', function (e) {
            view.storage.del(view.getId());
            e.stopPropagation();
        });
    });

    view.on('storage-doc-deleted', function () {
        var parent = view.el.parentNode;
        if (parent) {
            parent.removeChild(view.el);
            trigger(parent, 'read', {bubbles: true});
        }
    });

    clb();
}
