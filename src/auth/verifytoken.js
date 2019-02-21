var jwt = require('jsonwebtoken');
var config = require('./config');
var user = require('../database/models/user.model');

function ValidateToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'token not provided' });
    } else {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.status(500).send({ error: 'Invalid token' });
            } else {
                req._id = decoded.id;
                user.findById(decoded.id, (err, doc) => {
                    req._admin = doc.isAdmin;
                    next();
                });
            }
        });
    }
}

module.exports = ValidateToken;