const app = require('./app');

const port = process.env.PORT || 8080;

var server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = server;