var vumigo = require('vumigo_v02');
var App = vumigo.App;
var AppTester = vumigo.AppTester;
var EndState = vumigo.states.EndState;
var MetricsHelper = require('../lib');
var assert = require('assert');

describe('MetricsHelper', function() {
    var app;
    var tester;
    var metricsH;

    beforeEach(function() {
        app = new App('states:test');
        tester = new AppTester(app);

        app.init = function() {
            metricsH = new MetricsHelper(app.im);
            return metricsH
                .add.total_unique_users('uniqueUsers')
                .add.total_unique_users()
                .add.total_sessions('sessions')
                .add.total_sessions()
                .add.total_sessions('sessions2')
                .add.total_state_entries('states:test', 'entries')
                .add.total_state_entries('states:test');
       };

        app.states.add('states:test', function(name) {
            return new EndState(name, {
                text: 'This is the end state.',
                next: 'states:test2'
            });
        });

        app.states.add('states:test2', function(name) {
            return new EndState(name, {
                text: 'This is the end state.',
                next: 'states:test'
            });
        });

        tester
            .setup.config.app({
                name: 'metricsHelper-tester'
            });
    });

    describe('When a new user accesses the service', function() {

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
                        .stores['metricsHelper-tester'].unique_users;
                    assert.deepEqual(metrics1, {agg: 'sum', values: [ 1 ]});
                    assert.deepEqual(metrics2, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should fire the metric for each new user', function() {
            return tester
                .inputs(
                    {from_addr: '+271234', content: null},
                    {from_addr: '+274321', content: null})
                .check(function(api, im , app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].uniqueUsers;
                    assert.deepEqual(metrics, {agg: 'sum', values: [ 1, 1 ]});
                })
                .run();
        });

        it('should not fire the metrics for existing users', function() {
            return tester
                .setup.user({addr: '+271234', state:'states:test'})
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics.stores['metricsHelper-tester'];
                    assert.equal(metrics.uniqueUsers, undefined);
                })
                .run();
        });

    });

    describe('when a new session is started', function() {

        it('should fire the sessions metric', function() {
            return tester
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions;
                    assert.deepEqual(metrics, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should fire both sessions metrics', function() {
            return tester
                .start()
                .check(function(api, im, app) {
                    metric1 = api.metrics
                        .stores['metricsHelper-tester'].sessions;
                    metric2 = api.metrics
                        .stores['metricsHelper-tester'].total_sessions;
                    assert.deepEqual(metric1, {agg: 'sum', values: [ 1 ]});
                    assert.deepEqual(metric2, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should fire the metric for each new session', function() {
            return tester
                .inputs(null, null)
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions;
                    assert.deepEqual(metrics, {agg: 'sum', values: [ 1, 1 ]});
                })
                .run();
        });

        it('should not fire when resuming a session', function() {
            return tester
                .input('resume')
                .check(function(api, im, app) {
                    metrics = api.metrics.stores['metricsHelper-tester'];
                    assert.equal(metrics.sessions, undefined);
                })
                .run();
        });

    });

    describe('when the state is entered', function() {

        it('should trigger the state enter metric', function() {
            return tester
                .start()
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].entries;
                    assert.deepEqual(metrics, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should trigger both state enter metrics', function() {
            return tester
                .start()
                .check(function(api, im, app) {
                    metric1 = api.metrics
                        .stores['metricsHelper-tester'].entries;
                    metric2 = api.metrics
                        .stores['metricsHelper-tester'].total_state_entries;
                    assert.deepEqual(metric1, {agg: 'sum', values: [ 1 ]});
                    assert.deepEqual(metric2, {agg: 'sum', values: [ 1 ]});
                })
                .run();
        });

        it('should trigger each time the state is entered', function() {
            return tester
                .inputs(null, null)
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].entries;
                    assert.deepEqual(metrics, {agg: 'sum', values: [ 1, 1 ]});
                })
                .run();
        });

    });

});
