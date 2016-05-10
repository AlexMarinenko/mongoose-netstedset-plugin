var config = require('config');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');

var Item = require('./item');

var rootNodeId;
var siblingId;

describe('Root behaviour', function (){

    before(function (done){
        mongoose.connect(config.dbURI, function () {
            /* Drop DB before tests */
            mongoose.connection.db.dropDatabase(function (){
                done();
            });
        });
    });

    it('AddRoot with new root creates a new Root record.', function (done){
        Item.addRoot(1, { title: "Root 1" }, function (error, createdRoot){
            expect(error).to.be.null;
            expect(createdRoot).to.be.not.null;
            expect(createdRoot.root).to.be.equal(1);
            expect(createdRoot.title).to.be.equal("Root 1");
            expect(createdRoot.lft).to.be.equal(1);
            expect(createdRoot.rgt).to.be.equal(2);
            expect(createdRoot.lvl).to.be.equal(1);
            rootNodeId = createdRoot._id;
            done();
        });
    });

    it('AddChild to Root node adds a child to it', function (done){
        Item.addChild( { _id: rootNodeId }, { title: "Child 1.1" }, function (error, createdItem){
            expect(error).to.be.null;
            expect(createdItem).to.be.not.null;
            expect(createdItem.title).to.be.equal("Child 1.1");
            expect(createdItem.root).to.be.equal(1);
            expect(createdItem.lft).to.be.equal(2);
            expect(createdItem.rgt).to.be.equal(3);
            expect(createdItem.lvl).to.be.equal(2);
            siblingId = createdItem._id;
            done();
        });
    });

    it('AddAfter a sibling node adds a child after it', function (done){
        Item.addAfter( { _id: siblingId }, { title: "Child 1.2" }, function (error, createdItem){
            expect(error).to.be.null;
            expect(createdItem).to.be.not.null;
            expect(createdItem.title).to.be.equal("Child 1.2");
            expect(createdItem.root).to.be.equal(1);
            expect(createdItem.lft).to.be.equal(4);
            expect(createdItem.rgt).to.be.equal(5);
            expect(createdItem.lvl).to.be.equal(2);
            done();
        });
    });

    it('AddAfter unknown node returns error', function (){
        Item.addAfter( { _id: 123 }, { title: "Some title" }, function (error, createdItem){
            expect(error).to.be.not.null;
            expect(error).to.be.equal('Sibling node was not found by condition');
            expect(createdItem).to.be.null;
        });
    });

    it('AddChild to 1.1 level adds 1.1.1 level', function (done){
        Item.addChild( { _id: siblingId }, { title: "Child 1.1.1" }, function (error, createdItem){
            expect(error).to.be.null;
            expect(createdItem).to.be.not.null;
            expect(createdItem.title).to.be.equal("Child 1.1.1");
            expect(createdItem.root).to.be.equal(1);
            expect(createdItem.lft).to.be.equal(3);
            expect(createdItem.rgt).to.be.equal(4);
            expect(createdItem.lvl).to.be.equal(3);
            done();
        });
    });

    it('AddChild to unknown node returns error', function (){
        Item.addChild( { _id: 123 }, { title: "Some title" }, function (error, createdItem){
            expect(error).to.be.not.null;
            expect(error).to.be.equal('Parent node was not found by condition');
            expect(createdItem).to.be.null;
        });
    });

    it('GetChildren returns all children', function (done){
        Item.getChildren( { _id: rootNodeId }, function (error, children){
            expect(error).to.be.null;
            expect(children).to.be.not.null;
            expect(children.length).to.be.equal(3);
            expect(children[0].title).to.be.equal("Child 1.1");
            expect(children[1].title).to.be.equal("Child 1.1.1");
            expect(children[2].title).to.be.equal("Child 1.2");
            done();
        });
    });

    it('GetChildren of unknown node returns error', function (){
        Item.getChildren( { _id: 123 }, function (error, children){
            expect(error).to.be.not.null;
            expect(error).to.be.equal('Base node was not found by condition');
            expect(children).to.be.null;
        });
    });

    it('GetDirectChildren returns only immediate children', function (done){
        Item.getDirectChildren( { _id: rootNodeId }, function (error, children){
            expect(error).to.be.null;
            expect(children).to.be.not.null;
            expect(children.length).to.be.equal(2);
            done();
        });
    });

    it('GetDirectChildren of unknown node returns error', function (){
        Item.getDirectChildren( { _id: 123 }, function (error, children){
            expect(error).to.be.not.null;
            expect(error).to.be.equal('Base node was not found by condition');
            expect(children).to.be.null;
        });
    });

    it('GetTree returns ordered tree', function (done){
        Item.getTree(function (error, treeNodes){
            expect(error).to.be.null;
            expect(treeNodes).to.be.not.null;
            expect(treeNodes.length).to.be.equal(4);
            expect(treeNodes[0].title).to.be.equal("Root 1");
            expect(treeNodes[1].title).to.be.equal("Child 1.1");
            expect(treeNodes[3].title).to.be.equal("Child 1.1.1");
            expect(treeNodes[2].title).to.be.equal("Child 1.2");
            done();
        });
    });

    it('Remove Root node deletes all the tree', function (done){
        Item.removeNode( { _id: rootNodeId }, function (error, affected) {
            expect(error).to.be.null;
            expect(affected.length).to.be.equal(4);
            done();
        });
    });

    it('Remove unknown node returns error', function (){
        Item.getDirectChildren( { _id: 123 }, function (error, affected){
            expect(error).to.be.not.null;
            expect(error).to.be.equal('Node to remove was not found by condition');
            expect(affected).to.be.null;
        });
    });

});

