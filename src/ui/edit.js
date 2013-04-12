'use strict';

module.exports = Edit;

/**
 * Creates an edit view to edit the element
 * in an overlay with the edit context template
 *
 * This allows to make invisible properties editable
 *
 * @param view
 * @param clb
 */
function Edit (view, clb) {
    var ContentElement = require('../content-element');

    view.on('edit', function () {

        var editNode = document.createElement('div');
        editNode.setAttribute('x-context', 'edit');

        ContentElement({
            el:         editNode,
            id:         view.getId(),
            storage:    options.storage,
            templates:  options.templates
        });

        dialog(editNode).overlay().show();
    });

    clb();
}