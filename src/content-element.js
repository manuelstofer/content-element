'use strict';

var View    = require('./core/view'),
    trigger = require('trigger-event');

module.exports = ContentElement;

/**
 * Initializes the content element
 *
 * @returns a promise
 */
function ContentElement (options, clb) {

    var view = View(options),
        init = [
            require('./core/storage'),
            require('./core/template'),
            require('./core/collection'),
            require('./core/binding'),
            require('./core/remove'),
            require('./ui/collection-toolbar'),
            require('./core/subelement'),
            require('./core/query'),
            require('./ui/edit'),
            require('./ui/toolbar'),
            complete
        ];

    sequential(init);

    function sequential(sequence) {
        if (sequence.length == 0) {
            return clb(null);
        }
        sequence[0](view, function (err) {
            if (err && clb) { clb(err) }
            sequential(sequence.slice(1));
        });
    }

    function complete(err) {
        if (clb) {
            clb(err, view);
            trigger(view.el, 'add-element', {
                bubbles: true,
                detail: {
                    view: view
                }
            });
        }
    }

    return view;
}