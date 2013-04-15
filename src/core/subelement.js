'use strict';

var each            = require('foreach'),
    trigger         = require('trigger-event'),
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


    var toInit = 0,
        ready = false;

    if (getSubElements().length === 0) { clb(); }

    view.on('storage-doc-changed', function () {
        initSubElements(getSubElements());
    });

    initSubElements(getSubElements());

    function getSubElements () {
        return view.$('[x-id]');
    }

    function initSubElements (nodes) {
        each(nodes, initSubElement);
    }

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


    /**
     * Decrements elements to initialize
     * calls callback when all elements are initialized
     */
    function initialized () {
        if (--toInit === 0 && !ready) {
            ready = true;
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
            ++toInit;
            node = cleanNode(node);
            var options = {
                id:        id,
                el:        node,
                storage:   view.storage,
                templates: view.templates
            };
            ContentElement(options, function (err) {
                if (err && err.error == 'not-found') {
                    node.parentNode.removeChild(node);
                    trigger(view.el, 'read');
                }
                initialized();
            });
        }
    }
}
