var jwt = require('jsonwebtoken');
var config = require('./config');
var user = require('../database/models/user.model');

function ValidateToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'Token not provided' });
    } else {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.status(500).send({ error: 'Invalid token' });
            } else {
                user.findById(decoded.id).then(doc => {
                    req._id = doc._id;
                    req._admin = doc.isAdmin;
                    next();
                }).catch(err => {
                    return res.status(404).send({ error: 'User not found' });
                });
            }
        });
    }
}

module.exports = ValidateToken;