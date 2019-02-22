var express = require('express');
var router = express.Router();

router.get('/get500', (req, res) => {
    res.end({ 'thisJSON': 'Will not pass through' });
})

module.exports = router