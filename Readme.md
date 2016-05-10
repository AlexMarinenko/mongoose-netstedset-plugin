# Mongoose netstedset behaviour plugin

## Install

```bash
npm install mongoose-nestedset-plugin
```

## Usage

```javascript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    nestedSetPlugin = require('mongoose-nestedset-plugin');

var ItemSchema = new Schema({
    title: String
});

ItemSchema.plugin(nestedSetPlugin);

var Item = mongoose.model('Item', ItemSchema);
```

The plugin adds the following fields to your node:
- root - root Id to handle multiple-rooted trees
- lft - left  
- rgt - right
- level - nesting level


## Methods

### Add a new root

The method creates a new root node and fails if the ID has been already taken:

```javascript 
Item.addRoot(1, { title: "Root 1" }, function (error, createdRoot){
  // handle error or createdRoot node
});
```

### Add a new child

The method add a new node after all the children:

```javascript
Item.addChild( { _id: rootNodeId }, { title: "Child 1.1" }, function (error, createdChild){
  // handle error or createdChild
});
```

### Add a child node after some other
 
 The method add sibling node after selected one
 
 ```javascript
Item.addAfter( { _id: siblingId }, { title: "Child 1.2" }, function (error, createdItem){
    // handle
});
 ```
 
### Get child subtree

```javascript
Item.getChildren( { _id: 123 }, function (error, children){
 // handle
});
```

### Get immediate children only

```javascript
Item.getDirectChildren( { _id: 123 }, function (error, children){
 // handle
});
```

### Get tree

```javascript
Item.getTree(function (error, treeNodes){
 // handle
});
```

### Remove node 

```javascript
Item.removeNode( { _id: rootNodeId }, function (error, affected) {
 // handle
});
```