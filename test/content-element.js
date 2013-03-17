var content = require('content-element'),
    parker  = require('manuelstofer-richardparker'),
    storage = require('manuelstofer-storage');
expect = chai.expect;

describe('ContentElement', function () {

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

            client = {
                get: function  (id, fn) {
                    fn({
                        action: '',
                        data: {
                            id:      '0-0-0',
                            type:    'example',
                            title:   'title',
                            content: 'lorem ipsum dolor',
                            tags:    ['a', 'b', 'c']
                        }
                    });
                }
            },

            instance = content.ContentElement({
                id:       '0-0-0',
                storage:  client,
                templates: {
                    "example.html": template
                }
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
                    type: 'example',
                    id: 1,
                    title: 'title'
                }
            },

            client = storage.mock({data: data}),

            instance = content.ContentElement({
                id:       '1',
                storage:  client,
                templates: {
                    "example.html": template
                }
            });

        // @todo get rid of ugly setTimeout
        setTimeout(function () {
            var title = instance.el.querySelector('#title');
            document.body.appendChild(instance.el);
            title.value.should.equal('title');
            title.value = 'changed';
            triggerEvent(title, 'input');

            client.get(1, function (notification) {

                notification.data.id.should.equal(1);
                notification.data.title.should.equal('changed');
                done();
            });
        }, 20);

    });

    it('should render subviews', function (done) {

        var template = parker.compile('<input x-bind="value:title" class="title" />' +
                '{has subview ' +
                    '<div class="subview" x-template="template" x-id="{. subview}"></div>' +
                '}'),

            data = {
                '1': {
                    type:   'example',
                    title:  'title-1',
                    subview: '2'
                },
                '2': {
                    type:   'example',
                    title: 'title-2'
                }
            },

            instance = content.ContentElement({
                id:       '1',
                storage:  storage.mock({data: data}),
                templates: {
                    "example.html": template
                }
            });

        setTimeout(function () {
            document.body.appendChild(instance.el);
            var title = instance.el.querySelector('.subview .title');
            title.value.should.equal('title-2');

            triggerEvent(title, 'input');
            done();
        }, 50);

    });


    it('click on x-remove should remove items', function (done) {

        var list = parker.compile(
                '<ul x-each="list">' +
                    '<li x-template="item" x-bind="x-id:list.x"></li>' +
                '</ul>'
            ),

            item = parker.compile('<span x-bind="text"></span> <span x-remove>remove</span>'),


            data = {
                '1': {
                    type: 'list',
                    list: [2, 3]
                },
                '2': {
                    type: 'item',
                    text: 'text-2'
                },
                '3': {
                    type: 'item',
                    text: 'text-3'
                }
            },

            client = storage.mock({data: data}),

            instance = content.ContentElement({
                id:       '1',
                storage:  client,
                templates: {
                    "list.html": list,
                    "item.html": item
                }
            });

        document.body.appendChild(instance.el);


        setTimeout(function () {

            var removeNode = instance.el.querySelectorAll('[x-remove]')[1]
            triggerEvent(removeNode, 'click');

            client.get(1, function (notification) {
                notification.data.list.length.should.equal(1);
                notification.data.list[0].should.equal("2");
                done();
            });
        }, 50);

    });
});


function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}