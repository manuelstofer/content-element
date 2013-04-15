'use strict';

var each    = require('foreach'),
    toolbar = require('toolbar'),
    trigger = require('trigger-event'),
    util    = require('../util/util');

module.exports = CollectionToolbar;

/**
 * Adds the toolbar for Collections
 *
 * @param view
 * @param clb
 */
function CollectionToolbar (view, clb) {

    var storage = view.storage;

    var collections = view.$('[x-collection]');
    each(collections, addToolbar);

    function addToolbar (collection){
        toolbar(view.el, {
            height: 20,
            position: 'left',
            icons: {
                "build/manuelstofer-content-element/resources/add.svg":  function () {
                    var contains = collection.getAttribute('x-contains'),
                        newElement = {
                            type: contains
                        };
                    storage.put(newElement, function (notification) {
                        var childNode = util.getChildTemplateNode(collection)
                        childNode.setAttribute('x-id', notification.doc._id);
                        collection.appendChild(childNode);
                        trigger(collection, 'read', {bubbles: true});
                    });
                }
            }
        });
    }
    clb();
}
