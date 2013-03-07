var content = require('content'),
    parker  = require('manuelstofer-richardparker');
expect = chai.expect;

describe('block', function () {

    it('should render data to the dom', function () {

        var template = parker.compile(
                '<div class="">' +
                   '<h1 x-bind="title" id="title">{. title}</h1>' +
                   '<p x-bind="content" id="content">{. content}</p>' +
                   '<ul x-each="tags" id="tags">' +
                        '{each tags <li x-bind="tags.x">{.}</li>}' +
                   '</ul>' +
                '</div>'
            ),

            storage = {
                get: function  (id, fn) {
                    fn(null, {
                        id:      '0-0-0',
                        title:   'title',
                        content: 'lorem ipsum dolor',
                        tags:    ['a', 'b', 'c']
                    });
                }
            },

            instance = content.block({
                id:       '0-0-0',
                storage:  storage,
                template: template
            });

        document.body.appendChild(instance.el);

        document.getElementById('title').innerHTML.should.equal('title');
        document.getElementById('tags').children.length.should.equal(3);
        document.getElementById('content').innerHTML.should.equal('lorem ipsum dolor');

        document.body.removeChild(instance.el);
    });

    it('should update the data in the storage', function (done) {

        var template = parker.compile('<input x-bind="value:title" id="title" />'),

            data = {
                '1': {
                    title: 'title'
                }
            },

            storage = {
                get: function (id, fn) {
                    fn(null, data[id]);
                },
                set: function (id, obj, fn) {
                    id.should.equal('1');
                    obj.title.should.equal('changed');


                    data[id] = obj;
                    if (fn) { fn(null); }
                    done();
                }
            },

            instance = content.block({
                id:       '1',
                storage:  storage,
                templates: {
                    example: template
                },
                template: 'example'
            }),
            title = instance.el.querySelector('#title');

        document.body.appendChild(instance.el);
        title.value.should.equal('title');
        title.value = 'changed';
        triggerEvent(title, 'input');
    });
});


function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}