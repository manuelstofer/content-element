var each = require('each'),
    event = require('event');

module.exports = function (instance, options) {

    instance.on('rendered', function () {
        var removeElements = instance.el.querySelectorAll('[x-remove]');
        each(removeElements, function (removeElement) {
            event.bind(removeElement, 'click', function (e) {
                options.storage.del(instance.getId());
                e.stopPropagation();
            });
        });
    });

    instance.on('del', function () {
        var parent = instance.el.parentNode;
        if (parent) {
            parent.removeChild(instance.el);
            triggerEvent(parent, 'read');
        }
    });
};

function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}