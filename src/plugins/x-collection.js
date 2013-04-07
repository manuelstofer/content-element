'use strict';
var each    = require('foreach'),
    event   = require('event'),
    toolbar = require('toolbar');

module.exports = function (instance, options) {

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


    instance.on('rendered', function () {

        var collections = instance.el.querySelectorAll('[x-collection]');
        each(collections, function (collection) {
            var pointer = collection.getAttribute('x-collection');
            collection.setAttribute('x-each', pointer);
            collection.appendChild(getChildTemplateNode(collection));

            toolbar(instance.el, {
                height: 20,
                position: 'left',
                icons: {
                    "build/manuelstofer-content-element/resources/add.svg":  function () {
                        var contains = collection.getAttribute('x-contains'),
                            newElement = {
                                type: contains
                            };
                        options.storage.put(newElement, function (notification) {
                            var childNode = getChildTemplateNode(collection)
                            childNode.setAttribute('x-id', notification.doc._id);
                            collection.appendChild(childNode);
                            triggerEvent(childNode, 'read');
                        });
                    }
                }
            });
        });
    });

};

function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}
