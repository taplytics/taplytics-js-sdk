function Queue() {

    var queue  = [];

    this.length = function() {
        return queue.length
    };

    this.isEmpty = function() {
        return (queue.length === 0);
    };

    this.enqueue = function(item) {
        queue.push(item);
    };

    this.enqueueAll = function(items) {
        if (!items || (items && typeof items !== "array"))
            return 0;

        var index = 0;
        for (index = 0; index < items.length; index++) {
            var item = items[index];
            this.enqueue(item);
        }

        return items.length;
    };

    this.dequeue = function() {
        if (queue.length == 0) return undefined;

        var item = queue.shift();

        return item;
    };

    this.flush = function() {
        var oldQueue = queue.slice();
        queue = [];
        return oldQueue;
    };

    this.peek = function() {
        return (queue.length > 0 ? queue[0] : undefined);
    };
}


module.exports = Queue;
