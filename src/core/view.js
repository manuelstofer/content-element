'use strict';

var extend  = require('extend'),
    View    = require('koboldmaki'),
    util    = require('../util/util');

module.exports = CreateView;

/**
 * Creates the View
 *
 * @param options
 * @returns {Object}
 */
function CreateView (options) {

    var view = View(extend({
        getId: function () {
            return options.id || view.el.getAttribute('x-id');
        },

        unload: function () {
            if (view.el.parentNode) {
                view.el.parentNode.removeChild(view.el);
            }
        }
    }, util, options));

    return view;
}
