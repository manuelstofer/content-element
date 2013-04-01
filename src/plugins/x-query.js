'use strict';

var each            = require('foreach'),
    event           = require('event');

module.exports = function (instance, options) {

    var ContentElement  = require('../content-element');

    var addQueryResult = function (queryElement, id) {
        var subEl = ContentElement({
            id:        id,
            storage:   options.storage,
            templates: options.templates,
            parent:    instance
        });
        queryElement.appendChild(subEl.el);
        return subEl;
    }

    instance.on('bound', function () {
        var queryElements = instance.el.querySelectorAll('[x-query]');
        each(queryElements, function (queryElement) {

            var query = JSON.parse(queryElement.getAttribute('x-query'));

            instance.deferInit();
            options.storage.query(query, function (notification) {

                var resultElements = {};

                each(notification.docs, function (doc) {
                    instance.deferInit();
                    var resultElement = addQueryResult(queryElement, doc._id);
                    resultElement.on('initialized', instance.progressInit);
                    resultElements[doc._id] = resultElement;
                });

                instance.progressInit();

                return  {
                    match: function (notification) {
                        var id = notification.doc._id;
                        resultElements[id] = addQueryResult(queryElement, id);
                    },

                    unmatch: function (notification) {
                        var id = notification._id || notification.doc._id;
                        resultElements[id].unload();
                    }
                }
            });
        });
    });
};


