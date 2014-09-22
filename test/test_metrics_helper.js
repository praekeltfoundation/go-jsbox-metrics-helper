var vumigo = require('vumigo_v02');
var App = vumigo.App;
var AppTester = vumigo.AppTester;

describe('MetricsHelper', function() {
    var app;
    var tester;

    beforeEach(function() {
        app = new App('states:test');
        tester = new AppTester(app);
    });
});
