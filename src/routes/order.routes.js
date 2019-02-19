var express = require('express');
var router = express.Router();
var OrderModel = require('../database/models/order.model');

router.get('/', (req, res) => {
    OrderModel
        .find({})
        .then(doc => {
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(404).json({ 'error': 'Cannot find any order' });
        });
});

router.get('/:id', (req, res) => {
    if (req.headers.authorization) {
        OrderModel
            .find({ _id: req.params.id })
            .then(doc => {
                return res.status(200).json(doc);
            })
            .catch(err => {
                return res.status(404).json({ 'status': 'User not found' });
            });
    } else {
        return res.status(403).json({ error: "Invalid user request ..." });
    }
});

router.delete('/:id', (req, res) => {
    if (req.headers.authorization) {
        OrderModel.findOneAndDelete(
            { _id: req.params.id }).then(doc => {
                return res.status(200).json(doc);
            }).catch(er => {
                return res.status(404).json({ 'status': 'User not found' });
            });
    } else {
        return res.status(403).json({ error: "Invalid user request ..." });
    }
});

router.put('/:id', (req, res) => {
    if (req.headers.authorization) {
        OrderModel.findOneAndUpdate(
            { _id: req.params.id }, req.body, { new: true }).then(doc => {
                return res.status(200).json(doc);
            }).catch(er => {
                return res.status(404).json({ 'status': 'Order details not found' });
            });
    } else {
        return res.status(403).json({ error: "Invalid order request ..." });
    }
});


module.exports = router