const mongoose = require('mongoose');
require('../app');

describe('API connects with MongoDB', function () {
    test('Database is posdb', (done) => {
        expect(mongoose.connection.name).toBe('posdb');
        done();
    });
    test('Connection port is 27017', (done) => {
        expect(mongoose.connection.port).toBe(27017);
        done();
    });
});