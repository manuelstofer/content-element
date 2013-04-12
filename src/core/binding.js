'use strict';

var pflock = require('pflock');

module.exports = Binding;

/**
 * Adapter for pflock
 *
 * @param view
 * @param clb
 */
function Binding (view, clb) {

    var binding = pflock(view.el, view.doc);

    binding.on('changed', function () {
        view.emit('dom-doc-changed', binding.data);
    });

    view.on('storage-doc-changed', function (doc) {
        binding.toDocument(doc);
        view.emit('bining-updated');
    });

    clb();
}
