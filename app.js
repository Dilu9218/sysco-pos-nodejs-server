const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
require('./src/database/database');

var todos = require('./src/routes/test.routes');
var admin = require('./src/routes/admin.routes');
var user = require('./src/routes/user.routes');
var order = require('./src/routes/order.routes');

const app = express();
app.use(cors());

/* app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`)
    next()
}) */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.use('/api/todos', todos);
app.use('/api/admin', admin);
app.use('/api/user', user);
app.use('/api/order', order);

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, './public/404.html'))
});

app.use((err, req, res, next) => {
    res.sendFile(path.join(__dirname, './public/500.html'))
});

module.exports = app;