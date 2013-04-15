'use strict';

var each    = require('foreach');

module.exports = Query;

/**
 * Adds support for queries
 *
 * @param view
 * @param clb
 */
function Query (view, clb) {

    var ContentElement  = require('../content-element'),
        storage = view.storage;

    var queryElements = view.$('[x-query]');
    each(queryElements, initNode);
    if (queryElements.length === 0) { clb(); }

    function getQuery (node) {
        return JSON.parse(node.getAttribute('x-query'));
    }

    function initNode (node) {
        var query = getQuery(node);
        storage.query(query, function (notification) {
            return handleQueryResult(node, notification);
        });
    }

    function handleQueryResult (node, notification) {

        var resultElements = {},
            toInit = 0;

        each(notification.docs, function (doc) {
            toInit++;
            resultElements[doc._id] = addQueryResult(node, doc._id, function () {
                if(--toInit == 0) {
                    clb();
                }
            });
        });

        if (notification.docs.length === 0) { clb(); }

        return  {
            match: function (notification) {
                var id = notification.doc._id;
                resultElements[id] = addQueryResult(node, id);
            },

            unmatch: function (notification) {
                var id = notification._id || notification.doc._id;
                resultElements[id].unload();
            }
        }
    }

    function addQueryResult (node, id, fn) {
        return ContentElement(
            {
                id:        id,
                storage:   storage,
                templates: view.templates
            },
            function (err, view) {
                node.appendChild(view.el);
                if (fn) { fn(); }
            }
        );
    }
}
