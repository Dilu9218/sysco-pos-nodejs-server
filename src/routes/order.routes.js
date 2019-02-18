var express = require('express');
var router = express.Router();
var OrderModel = require('../database/models/order.model');

router.get('/', (req, res) => {
    ToDoModel
        .find({})
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(404).json({ 'error': 'Cannot find any todos' });
        });
});

router.get('api/orders', (req, res) => {
    db.collection('col_orders').find().toArray(function (err, result) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

router.get('api/order/:id', (req, res) => {
    db.collection('col_orders').findOne({ _id: ObjectID(req.params.id) }, function (err, result) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

router.delete('api/order/:id', (req, res) => {
    var myquery = { _id: ObjectID(req.params.id) };
    db.collection('col_orders').deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(req.url);
    });
});

router.put('api/order/:id', (req, res) => {
    var myquery = { _id: ObjectID(req.params.id) };
    db.collection('col_orders').findOne(myquery)
        .then(r => {
            var newvalues = { $set: { completed: !r.completed } };
            db.collection('col_orders').updateOne(myquery, newvalues, function (err, rs) {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 'error': 'Error in toggling complete state' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 'error': 'none' }));
            });
        });
});


module.exports = router