'use strict';

var util = module.exports = {

    /**
     * Returns the template context of a dom element
     *
     * @param el
     * @returns {String|undefined}
     */
    getContext: function (el) {
        while (el.parentNode) {
            var context = el.getAttribute('x-context');
            if (context) {
                return context;
            }
            el = el.parentNode;
        }
    },

    getChildTag: function (collection) {
        var tagMap = {
            UL: 'LI',
            OL: 'LI'
        };
        return tagMap[collection.nodeName] || 'div'
    },

    getChildTemplateNode: function (collection) {
        var childTag = util.getChildTag(collection),
            pointer  = collection.getAttribute('x-collection'),
            node     = document.createElement(childTag);
        node.setAttribute('x-bind', 'x-id:' + pointer + '/x');
        return node;
    }
};