'use strict';
var each    = require('each'),
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
                path = collection.getAttribute('x-collection'),
                node = document.createElement(childTag);
            node.setAttribute('x-bind', 'x-id:' + path + '.x');
            return node;
        };


    instance.on('rendered', function () {

        var collections = instance.el.querySelectorAll('[x-collection]');
        each(collections, function (collection) {
            var path = collection.getAttribute('x-collection');
            collection.setAttribute('x-each', path);
            collection.appendChild(getChildTemplateNode(collection));

            toolbar(instance.el, {
                height: 20,
                position: 'left',
                icons: {
                    "build/manuelstofer-content-element/resources/add.svg":  function () {
                        console.log('add');
                        var contains = collection.getAttribute('x-contains'),
                            element = {
                                type: contains
                            };
                        options.storage.put(element, function (notification) {

                            var childNode = getChildTemplateNode(collection)
                            childNode.setAttribute('x-id', notification.id);
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
