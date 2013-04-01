var content = require('content-element'),
    parker  = require('manuelstofer-richardparker'),
    storage = require('manuelstofer-repo');
expect = chai.expect;

describe('ContentElement', function () {

    it('should render document to the dom', function () {

        var template = parker.compile(
                '<div class="">' +
                   '<h1 x-bind="title" id="title">{. title}</h1>' +
                   '<p x-bind="content" id="content">{. content}</p>' +
                   '<ul x-each="tags" id="tags">' +
                        '{each tags <li x-bind="tags.x">{.}</li>}' +
                   '</ul>' +
                '</div>'
            ),

            docs = {
                '0-0-0': {
                    type:    'example',
                    title:   'title',
                    content: 'lorem ipsum dolor',
                    tags:    ['a', 'b', 'c']
                }
            },

            client = storage.mock({docs: docs}),

            instance = content.ContentElement({
                id:       '0-0-0',
                storage:  client,
                templates: {
                    "example.html": template
                }
            });



        document.body.appendChild(instance.el);
        instance.on('initialized', function () {
            document.getElementById('title').innerHTML.should.equal('title');
            document.getElementById('tags').children.length.should.equal(3);
            document.getElementById('content').innerHTML.should.equal('lorem ipsum dolor');

            document.body.removeChild(instance.el);
        });
    });

    it('should update the document in the storage', function (done) {

        var template = parker.compile('<input x-bind="value:title" id="title" />'),

            docs = {
                '1': {
                    type: 'example',
                    title: 'title'
                }
            },

            client = storage.mock({docs: docs}),

            instance = content.ContentElement({
                id:       '1',
                storage:  client,
                templates: {
                    "example.html": template
                }
            });

        instance.on('initialized', function () {

            var title = instance.el.querySelector('#title');
            document.body.appendChild(instance.el);
            title.value.should.equal('title');
            title.value = 'changed';
            triggerEvent(title, 'input');

            instance.on('saved', function () {
                client.get(1, function (notification) {
                    notification.doc._id.should.equal('1');
                    notification.doc.title.should.equal('changed');
                    done();
                });
            });
        });
    });

    it('should render subviews', function (done) {

        var template = parker.compile('<input x-bind="value:title" class="title" />' +
                '{has subview ' +
                    '<div class="subview" x-template="template" x-id="{. subview}"></div>' +
                '}'),

            docs = {
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
                storage:  storage.mock({docs: docs}),
                templates: {
                    "example.html": template
                }
            });

        instance.on('initialized', function () {
            document.body.appendChild(instance.el);
            var title = instance.el.querySelector('.subview .title');
            title.value.should.equal('title-2');

            triggerEvent(title, 'input');
            done();
        });

    });


    it('click on x-remove should remove items', function (done) {

        var list = parker.compile(
                '<ul x-each="list">' +
                    '<li x-template="item" x-bind="x-id:list.x"></li>' +
                '</ul>'
            ),

            item = parker.compile('<span x-bind="text"></span> <span x-remove>remove</span>'),


            docs = {
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

            client = storage.mock({docs: docs}),

            instance = content.ContentElement({
                id:       '1',
                storage:  client,
                templates: {
                    "list.html": list,
                    "item.html": item
                }
            });

        document.body.appendChild(instance.el);

        instance.on('initialized', function () {
            var removeNode = instance.el.querySelectorAll('[x-remove]')[1];
            triggerEvent(removeNode, 'click');
            client.get(1, function (notification) {
                notification.doc.list.length.should.equal(1);
                notification.doc.list[0].should.equal('2');
                done();
            });
        })
    });

    it('should be possible do queries using x-query', function (done) {

        var query = parker.compile(
                '<div x-query=\'{literal {"type": "item"}}\'></div>'
            ),

            item = parker.compile('<span x-bind="class:example" class=""></span>'),

            docs = {
                '1': {
                    type: 'item',
                    example: 'bla'
                },
                'query-element': {
                    type: 'query'
                }
            },

            client = storage.mock({docs: docs}),

            instance = content.ContentElement({
                id:       'query-element',
                storage:  client,
                templates: {
                    "item.html": item,
                    "query.html": query
                }
            });

        document.body.appendChild(instance.el);

        instance.on('initialized', function () {
            instance.el.querySelector('.bla').should.be.defined;

            client.put({type: 'item', example: 'added-element'}, function (n) {

                setTimeout(function () {
                    instance.el.querySelector('.added-element').should.be.defined;

                    client.del('1');
                    client.del(n.doc._id);

                    setTimeout(function () {
                        expect(instance.el.querySelector('.bla')).to.be.null
                        expect(instance.el.querySelector('.added-element')).to.be.null

                        done();
                    }, 30);
                }, 30);
            });
        });
    });
});


function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}