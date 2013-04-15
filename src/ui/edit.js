'use strict';

module.exports = Edit;

var dialog = require('dialog'),
    ContentElement = require('../content-element');

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

    view.on('edit', function () {

        var editNode = document.createElement('div');
        editNode.setAttribute('x-context', 'edit');

        ContentElement(
            {
                el:         editNode,
                id:         view.getId(),
                storage:    view.storage,
                templates:  view.templates
            },
            function () {
                dialog(editNode).overlay().show();
            }
        );

    });

    clb();
}