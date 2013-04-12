'use strict';

module.exports = {

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
    }
};