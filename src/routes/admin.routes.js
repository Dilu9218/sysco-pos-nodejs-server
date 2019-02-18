var express = require('express');
var router = express.Router();
var AdminModel = require('../database/models/user.model');

router.post('/user/add', (req, res) => {
    try {
        if (req.headers.authorization) {
            // TODO: Verify authentication
            let t = new AdminModel(req.body);
            t.save().then(doc => {
                res.status(200).json({ 'status': 'User created' });
            }).catch(err => {
                if (err.name === 'MongoError' && err.code === 11000) {
                    return res.status(409).json({ 'error': 'Duplicate user name' });
                }
                if (err.name === 'ValidationError') {
                    return res.status(400).json({ 'error': 'Username is required' });
                }
            });
        } else {
            return res.status(403).json({ error: "Invalid user request ..." });
        }
    } catch (e) {
        if (e instanceof TypeError) {
            res.status(500).json({ error: "Database seems out of our hands ..." });
        } else if (e instanceof ReferenceError) {

        }
    }
});

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

router.post('/api/admin/login', (req, res) => {
    if (req.url === '/todos/') {
        db.collection('col_users').insertOne(req.body, function (err, r) {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ _id: r.insertedId }));
        });
    }
});

router.get('/api/admin/logout', (req, res) => {
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
})

router.get('/api/admin/users', (req, res) => {
    db.collection('col_users').find().toArray(function (err, result) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

router.get('/api/admin/user/:id', (req, res) => {
    db.collection('col_users').findOne({ _id: ObjectID(req.params.id) }, function (err, result) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

router.delete('/api/admin/user/:id', (req, res) => {
    var myquery = { _id: ObjectID(req.params.id) };
    db.collection('col_users').deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(req.url);
    });
});

router.get('/api/admin/orders', (req, res) => {
    db.collection('col_orders').find().toArray(function (err, result) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

router.get('api/admin/order/:id', (req, res) => {
    db.collection('col_orders').findOne({ _id: ObjectID(req.params.id) }, function (err, result) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
});

router.put('api/admin/order/:id', (req, res) => {
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

router.delete('api/admin/order/:id', (req, res) => {
    var myquery = { _id: ObjectID(req.params.id) };
    db.collection('col_orders').deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(req.url);
    });
});

module.exports = router