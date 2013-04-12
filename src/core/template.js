'use strict';
var util = require('../util/util');

module.exports = Template;

/**
 * Renders the template
 *
 * @param view
 * @param clb
 */
function Template (view, clb) {

    var templates   = view.templates,
        type        = view.doc.type,

        getTemplate = function () {
            var context         = util.getContext(view.el),
                templateName    = type,
                contextTemplate = templates[context + '/' + templateName],
                template        = contextTemplate || templates[templateName];

            if (!template) {
                clb('no template');
                throw new Error('No template found for type: ' + type);
            }
            return template;
        };

    var template = getTemplate();
    view.el.innerHTML = template(view.doc);
    clb();
}
