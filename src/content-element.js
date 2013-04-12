'use strict';

var View = require('./core/view');

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
            require('./core/subelement'),
            require('./core/query'),
            require('./ui/edit'),
            require('./ui/toolbar'),
            function () { clb(null, view); }
        ];

    function sequential (sequence) {
        if (sequence.length == 0) {
            return clb(null);
        }
        sequence[0](view, function (err) {
            if (err) { clb(err) }
            sequential(sequence.slice(1));
        });
    }
    sequential(init);
    return view;
}