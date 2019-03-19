const request = require("supertest");
const app = require("../app");

describe("Checks invalid address redirection", function () {

    it("Try to find a file not existing", function (done) {
        request(app)
            .get("/api/path/not/exists")
            .expect(200).then(r => {
                expect(r.text).toBe('<!DOCTYPE html>\n<html lang="en">\n\n<head>\n    <title>Resource not found</title>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">\n    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>\n    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>\n</head>\n\n<body>\n\n    <div class="container">\n        <div class="jumbotron">\n            <h1>404</h1>\n            <p>Resource not found!</p>\n        </div>\n    </div>\n\n</body>\n\n</html>')
                done();
            })
    });

    it("Try to generate an error to get a 500", function (done) {
        request(app)
            .get("/api/tests/get500")
            .expect(200).then(r => {
                expect(r.text).toBe('<!DOCTYPE html>\n<html lang="en">\n\n<head>\n    <title>Internal Error</title>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">\n    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>\n    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>\n</head>\n\n<body>\n\n    <div class="container">\n        <div class="jumbotron">\n            <h1>500</h1>\n            <p>Oops! Internal server error!</p>\n        </div>\n    </div>\n\n</body>\n\n</html>');
                done();
            })
    });
});