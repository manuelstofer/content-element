'use strict';

var each = require('foreach'),
    util = require('../util/util');

module.exports = Collection;

/**
 * Collections for sub views
 *
 * @param view
 * @param clb
 */
function Collection (view, clb) {


    var collections = view.$('[x-collection]');
    each(collections, function (collection) {
        if (collection.childNodes.length === 0) {
            var pointer = collection.getAttribute('x-collection');
            collection.setAttribute('x-each', pointer);
            collection.appendChild(util.getChildTemplateNode(collection));
        }
    });
    clb();
}

