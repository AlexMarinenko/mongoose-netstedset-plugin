module.exports = function (schema, options) {

    schema.add({
        root: Number,
        lft: Number,
        rgt: Number,
        lvl: Number
    });

    schema.statics.addRoot = function (root, item, callback) {

        var model = this;

        model.find({root: root, lft: 1}, function (err, results) {

            if (results.length > 0) {
                throw new Error('The root with id=' + root + ' already exists.');
            }

            item.root = root;
            item.lvl = 1;
            item.lft = 1;
            item.rgt = 2;
            model.create( item, function (err, storedItem) {callback && callback(err, storedItem)});

        });
    };

    var addChildByPoint = function (model, root, lvl, point, child, callback){
        model.update({rgt: {$gt: point}}, {$inc: {rgt: 2}}, {multi: true}, function (error, affected) {
            model.update({lft: {$gt: point}}, {$inc: {lft: 2}}, {multi: true}, function (error, affected) {
                child.lft =  point + 1;
                child.rgt =  point + 2;
                child.root = root;
                child.lvl = lvl;
                model.create(child, function (error, storedItem) {callback && callback(error, storedItem)});
            });
        });
    };

    schema.statics.addChild = function (conditions, child, callback) {

        var model = this;

        model.findOne(conditions, function (err, parentItem) {

            if (parentItem === undefined ){
                callback && callback('Parent node was not found by condition', null);
                return;
            }

            model.findOne({ "lft": {$gt: parentItem.lft}, "rgt": {$lt: parentItem.rgt} }, null, {sort: {rgt: -1}}, function (err, childItem) {
                var point = childItem ? childItem.rgt : parentItem.lft;
                addChildByPoint(model, parentItem.root, parentItem.lvl + 1, point, child, callback);
            });

        });

    };

    schema.statics.addAfter = function (conditions, child, callback) {

        var model = this;

        model.findOne(conditions, function (err, siblingItem) {

            if (siblingItem === undefined){
                callback && callback('Sibling node was not found by condition', null);
                return;
            }
            addChildByPoint(model, siblingItem.root, siblingItem.lvl, siblingItem.rgt, child, callback);

        });

    };

    schema.statics.getDirectChildren = function (conditions, callback){

        var model = this;

        model.findOne(conditions, function (err, baseItem){

            if (baseItem === undefined){
                callback && callback('Base node was not found by condition', null);
                return;
            }

            model.find( { lft: { $gt: baseItem.lft }, rgt: { $lt: baseItem.rgt }, lvl: baseItem.lvl + 1 }, function (error, children) {
                callback && callback(error, children);
            });

        });

    };

    schema.statics.getChildren = function (conditions, callback){

        var model = this;

        model.findOne(conditions, function (err, baseItem){

            if (baseItem === undefined){
                callback && callback('Base node was not found by condition', null);
                return;
            }

            model.find( { lft: { $gt: baseItem.lft }, rgt: { $lt: baseItem.rgt } }).sort({ lft: 1 }).exec(function (error, children) {
                callback && callback(error, children);
            });

        });
    };

    schema.statics.getTree = function (callback){

        var model = this;

        model.find( {}, null, { $sort: { lft: 1 } }, function (error, treeNodes){
            callback && callback(error, treeNodes);
        });
    };

    schema.statics.removeNode = function (conditions, callback) {

        var model = this;

        model.findOne(conditions, function (err, nodeToRemove){

            if (nodeToRemove === undefined){
                callback && callback('Node to remove was not found by condition', null);
                return;
            }

            var left = nodeToRemove.lft;
            var right = nodeToRemove.rgt;
            var width = right - left + 1;

            model.find( { lft: { $gte: left, $lte: right }  }, function (error, nodes) {

                var count = 0;

                nodes.forEach(function (node){
                    node.remove(function (error){
                        count++;
                        if (count == nodes.length - 1){
                            model.update({rgt: {$gt: right}}, {$inc: {rgt: -width}}, {multi: true}, function (error, affected) {
                                model.update({lft: {$gt: right}}, {$inc: {lft: -width}}, {multi: true}, function (error, affected) {
                                    callback && callback(error, nodes);
                                });
                            });

                        }
                    });
                });

            });

        });
    };

};