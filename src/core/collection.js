'use strict';

var each = require('foreach');

module.exports = Collection;

/**
 * Collections for sub views
 *
 * @param view
 * @param clb
 */
function Collection (view, clb) {

    var getChildTag = function (collection) {
            var tagMap = {
                UL: 'LI',
                OL: 'LI'
            };
            return tagMap[collection.nodeName] || 'div'
        },

        getChildTemplateNode = function (collection) {
            var childTag = getChildTag(collection),
                pointer  = collection.getAttribute('x-collection'),
                node     = document.createElement(childTag);
            node.setAttribute('x-bind', 'x-id:' + pointer + '.x');
            return node;
        };

    var collections = view.el.querySelectorAll('[x-collection]');
    each(collections, function (collection) {
        if (collection.childNodes.length === 0) {
            var pointer = collection.getAttribute('x-collection');
            collection.setAttribute('x-each', pointer);
            collection.appendChild(getChildTemplateNode(collection));
        }
    });
    clb();
}

