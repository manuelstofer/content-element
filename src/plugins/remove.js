var each = require('each'),
    event = require('event');

module.exports = function (instance, options) {

    instance.on('rendered', function () {
        instance.el.querySelectorAll('[x-remove]');
        event.bind(instance.el, 'click', function (e) {
            var parent = instance.el.parentNode;
            
            options.storage.del(instance.getId(), function (notification) {

                if (notification.action == 'del') {
                    parent.removeChild(instance.el);
                    triggerEvent(parent, 'read');
                }
            });
            e.stopPropagation();
        });
    });
};

function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}