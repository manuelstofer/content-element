'use strict';

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
            var context         = view.getContext(view.el),
                templateName    = type,
                contextTemplate = templates[context + '/' + templateName],
                template        = contextTemplate || templates[templateName];


            return template;
        };

    var template = getTemplate();
    if (!template) {
        clb('no template');
    } else {
        view.el.innerHTML = template(view.doc);
        clb();
    }
}
