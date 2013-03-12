var content = require('content-element'),
    parker  = require('manuelstofer-richardparker');
expect = chai.expect;

function storageMock (data) {
    return {
        get: function (id, fn) {
            fn({
                data: data[id]
            });
        },
        put: function (obj, fn) {
            data[obj.id] = obj;
            if (fn) { fn({data: obj}); }
        },

        del: function (obj, fn) {
            delete data[obj.id];
            if (fn) {
                fn({
                    action: 'del',
                    id: obj.id
                });
            }
        }

    };
}

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
                    fn({
                        action: '',
                        data: {
                            id:      '0-0-0',
                            title:   'title',
                            content: 'lorem ipsum dolor',
                            tags:    ['a', 'b', 'c']
                        }
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
                    id: 1,
                    title: 'title'
                }
            },

            storage = storageMock(data),

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

        storage.get(1, function (notification) {

            notification.data.id.should.equal(1);
            notification.data.title.should.equal('changed');
            done();
        });
    });

    it('should render subviews', function (done) {

        var template = parker.compile('<input x-bind="value:title" class="title" />' +
                '{has subview ' +
                    '<div class="subview" x-template="template" x-id="{. subview}"></div>' +
                '}'),

            data = {
                '1': {
                    title:  'title-1',
                    subview: '2'
                },
                '2': {
                    title: 'title-2'
                }
            },

            instance = content.block({
                id:       '1',
                storage:  storageMock(data),
                templates: {
                    template: template
                },
                template: 'template'
            });

        document.body.appendChild(instance.el);
        var title = instance.el.querySelector('.subview .title');
        title.value.should.equal('title-2');

        triggerEvent(title, 'input');
        done();
    });


    it('click on remove should remove items', function () {

        var list = parker.compile(
                '<ul x-each="list">' +
                    '<li x-template="item" x-bind="x-id:list.x"></li>' +
                '</ul>'
            ),

            item = parker.compile('<span x-bind="text"></span> <span x-delete>delete</span>'),


            data = {
                '1': {
                    list: [2, 3]
                },
                '2': {
                    text: 'text-2'
                },
                '3': {
                    text: 'text-3'
                }
            },

            storage = storageMock(data),

            instance = content.block({
                id:       '1',
                storage:  storage,
                template: 'list',
                templates: {
                    list: list,
                    item: item
                }
            });

        document.body.appendChild(instance.el);


        var deleteNode = instance.el.querySelectorAll('[x-delete]')[1]
        triggerEvent(deleteNode, 'click');

        storage.get(1, function (notification) {
            notification.data.list.length.should.equal(1);
            notification.data.list[0].should.equal(2);
        });

    });
});


function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}