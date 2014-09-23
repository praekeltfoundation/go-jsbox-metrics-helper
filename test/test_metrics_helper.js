var vumigo = require('vumigo_v02');
var App = vumigo.App;
var AppTester = vumigo.AppTester;
var EndState = vumigo.states.EndState;
var MetricsHelper = require('../lib');
var assert = require('assert');
//var Q = require('q');

describe('MetricsHelper', function() {
    var app;
    var tester;
    var metricsH;

    beforeEach(function() {
        app = new App('states:test');
        tester = new AppTester(app);

        app.states.add('states:test', function(name) {
            return new EndState(name, {
                text: 'This is the end state.'
            });
        });

        tester
            .setup.config.app({
                name: 'metricsHelper-tester'
            });
    });

    describe('When a new user accesses the service', function() {
        beforeEach(function() {
            metricsH = new MetricsHelper(app.im);
            metricsH
                .add.totalUniqueUsers('uniqueUsers')
                .add.totalUniqueUsers('uniqueUsers2');
        });

        it('should display the first state text', function() {
            return tester
                .start()
                .check.interaction({
                    state: 'states:test',
                    reply: 'This is the end state.'
                })
                .run();
        });

        it('should fire the new user metrics', function() {
            return tester
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].uniqueUsers;
                    assert.deepEqual(metrics, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should fire both new user metrics', function() {
            return tester
                .start()
                .check(function(api, im , app) {
                    metrics1 = api.metrics
                        .stores['metricsHelper-tester'].uniqueUsers;
                    metrics2 = api.metrics
                        .stores['metricsHelper-tester'].uniqueUsers2;
                    assert.deepEqual(metrics1, {agg: 'sum', values: [ 1 ]});
                    assert.deepEqual(metrics2, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should not fire the metrics for existing users', function() {
            return tester
                .setup.user({addr: '+271234', state:'states:test'})
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics.stores;
                    assert.deepEqual(metrics, []);
                })
                .run();
        });

    });
});
