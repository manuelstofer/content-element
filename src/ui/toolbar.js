'use strict';

var toolbar = require('toolbar');

module.exports = Toolbar;

/**
 * Adds a toolbar to the element
 *
 * @param view
 * @param clb
 */
function Toolbar (view, clb)  {

    function getIconPath (icon) {
        return "build/manuelstofer-content-element/resources/" + icon;
    }

    var icons = {};

    icons[getIconPath('remove.svg')] = function () {
        view.storage.del(view.getId());
    };

    if (view.templates['edit/' + view.doc.type + '.html']) {
        icons[getIconPath('edit.svg')] = function () {
            view.emit('edit');
        };
    }

    toolbar(view.el, {
        height: 20,
        position: 'right',
        icons: icons
    });
    clb();
}
