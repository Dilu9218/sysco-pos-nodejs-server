var express = require('express');
var router = express.Router();
var ToDoModel = require('../database/models/todo.model');

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

router.put('/:id', (req, res) => {
    ToDoModel.findOne({ _id: req.params.id }).then(doc => {
        doc.completed = !doc.completed;
        doc.save().then(doc => {
            console.log(doc);
            res.status(201).json({ 'status': 'Todo updated' });
        }).catch(err => {
            res.status(500).json({ 'error': 'Operation failed' });
        })
    });
})

router.post('/', (req, res) => {
    let t = new ToDoModel(req.body);
    t.save().then(doc => {
        res.status(200).json({ _id: doc._id });
    }).catch(err => {
        res.status(500).json({ 'error': 'Operation failed' });
    });
});


router.delete('/:id', (req, res) => {
    ToDoModel
        .findOneAndRemove({ _id: req.params.id })
        .then(response => {
            if (response) {
                res.status(200).json({ 'status': 'Deleted successfully' });
            } else {
                res.status(404).json({ 'status': 'Cannot find entry' });
            }
        })
        .catch(err => {
            res.status(500).json({ 'error': 'Operation failed' });
        });
});

module.exports = router