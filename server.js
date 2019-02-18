const app = require('./app');

const port = 8080;

var server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = server;