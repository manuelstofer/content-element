'use strict';

module.exports = Storage;

/**
 * Storage adapter
 *
 * @param view
 * @param clb callback
 */
function Storage (view, clb) {

    var storage = view.storage;

    // counts the pending storage operations
    view.pendingStorageOps = 0;

    view.on('dom-doc-changed', updateStorage);

    /**
     * Writes the document back to the storage
     * - Only one document can be made at a time
     *
     * @param doc
     */
    function updateStorage (doc) {
        view.pendingStorageOps++;
        storage.put(doc, function () {
            view.pendingStorageOps--;
            view.emit('saved');
        });
    }

    /**
     * Notification handler object
     *
     * @type {{change: Function, del: Function}}
     */
    var updateHandler = {
        change: function (notification) {
            view.emit('storage-doc-changed', notification.doc);
        },
        del: function () {
            view.emit('storage-doc-deleted');
        }
    };

    // Loads the document from the storage
    storage.get(view.getId(), handleNotifications);

    /**
     * Callback for the initial result of the get operation
     *
     * @param notification
     * @returns {*}
     */
    function handleNotifications (notification) {

        if (notification.event === 'error') {
            console.log('failed to fetch content for: ' + view.getId());
            return clb(notification);
        }

        view.doc = notification.doc;
        clb();

        return updateHandler;
    }
}
