'use strict';

var each            = require('foreach'),
    event           = require('event'),
    toolbar         = require('toolbar'),
    ContentElement  = require('../content-element');

module.exports = SubElement;

/**
 * Initializes the sub elements
 * (elements with an x-id to load an other element)
 *
 * @param view
 * @param clb
 */
function SubElement (view, clb) {

    var nodes = view.el.querySelectorAll('[x-id]'),
        elementsToInitialize = 0;

    each(nodes, initSubElement);
    if (nodes.length === 0) { clb(); }

    /**
     * Replaces a DOM Node with a clone without event handlers
     *
     * @param node
     * @returns {*}
     */
    function cleanNode (node) {
        var clone = node.cloneNode(true);
        node.parentNode.insertBefore(clone, node);
        node.parentNode.removeChild(node);
        return clone;
    }

    function elementInitialized () {
        if (--elementsToInitialize === 0) {
            clb();
        }
    }

    /**
     * Initializes a sub element
     *
     * @param node
     * @returns {*}
     */
    function initSubElement (node) {
        var id = node.getAttribute('x-id');
        if (id !== node.contentElementId) {
            elementsToInitialize++;
            var options = {
                id:        id,
                el:        cleanNode(node),
                storage:   view.storage,
                templates: view.templates
            };
            var v = ContentElement(options, function (err) {
                elementInitialized(err);
            });
        }
    }
}
