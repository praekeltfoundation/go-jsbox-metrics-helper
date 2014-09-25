var vumigo = require('vumigo_v02');
var App = vumigo.App;
var AppTester = vumigo.AppTester;
var EndState = vumigo.states.EndState;
var FreeText = vumigo.states.FreeText;
var MetricsHelper = require('../lib');
var assert = require('assert');

describe('MetricsHelper', function() {
    var app;
    var tester;
    var metricsH;

    beforeEach(function() {
        app = new App('states:test');
        tester = new AppTester(app);

        app.states.add('states:test', function(name) {
            return new FreeText(name, {
                question: 'This is the first state.',
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

        beforeEach(function() {
            app.init = function() {
                metricsH = new MetricsHelper(app.im);
                metricsH
                    .add.total_unique_users('uniqueUsers')
                    .add.total_unique_users();
            };
        });

        it('should fire the new user metrics', function() {
            return tester
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].uniqueUsers;
                    assert.deepEqual(metrics, {agg: 'last', values: [ 1 ]});
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
                    assert.deepEqual(metrics1, {agg: 'last', values: [ 1 ]});
                    assert.deepEqual(metrics2, {agg: 'last', values: [ 1 ]});
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
                    assert.deepEqual(metrics, {agg: 'last', values: [ 1, 2 ]});
                })
                .run();
        });

        it('should not fire the metrics for existing users', function() {
            return tester
                .setup.user({addr: '+271234', state:'states:test'})
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics.stores['metricsHelper-tester'];
                    assert.equal(metrics, undefined);
                })
                .run();
        });

    });

    describe('when a new session is started', function() {

        beforeEach(function() {
            app.init = function() {
                metricsH = new MetricsHelper(app.im);
                metricsH
                    .add.total_sessions('sessions')
                    .add.total_sessions();
            };
        });

        it('should fire the sessions metric', function() {
            return tester
                .start()
                .check(function(api, im , app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions;
                    assert.deepEqual(metrics, {agg: 'last', values: [ 1 ]});
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
                    assert.deepEqual(metric1, {agg: 'last', values: [ 1 ]});
                    assert.deepEqual(metric2, {agg: 'last', values: [ 1 ]});
                })
                .run();
        });

        it('should fire the metric for each new session', function() {
            return tester
                .inputs(null, null)
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions;
                    assert.deepEqual(metrics, {agg: 'last', values: [ 1, 2 ]});
                })
                .run();
        });

        it('should not fire when resuming a session', function() {
            return tester
                .input('resume')
                .check(function(api, im, app) {
                    metrics = api.metrics.stores['metricsHelper-tester'];
                    assert.equal(metrics, undefined);
                })
                .run();
        });

    });

    describe('when the state action is triggered', function() {

        beforeEach(function() {
            app.init = function() {
                metricsH = new MetricsHelper(app.im);
                metricsH
                    .add.total_state_actions(
                        {state:'states:test', action:'exit'}, 'exits')
                    .add.total_state_actions({state:'states:test'});
            };
        });

        it('should trigger the state exit metric', function() {
            return tester
                .inputs(null, 'test')
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].exits;
                    assert.deepEqual(metrics, {agg: 'last', values: [ 1 ]});
                })
                .run();
        });

        it('should trigger the state enter metric', function() {
            return tester
                .start()
                .check(function(api, im, app) {
                    metric1 = api.metrics.stores['metricsHelper-tester']
                        .total_action_enter_states_test;
                    assert.deepEqual(metric1, {agg: 'last', values: [ 1 ]});
                })
                .run();
        });

        it('should trigger each time the state is entered', function() {
            return tester
                .inputs(null, 'test', null)
                .check(function(api, im, app) {
                    metrics = api.metrics.stores['metricsHelper-tester']
                        .total_action_enter_states_test;
                    assert.deepEqual(metrics, {agg: 'last', values: [ 1, 2 ]});
                })
                .run();
        });

        it('should throw an exception on bad state actions', function() {
            assert.throws( function() {
                metricsH.add.total_state_actions(
                    {state:'states:test', action:'foo'}, 'bad');},
                /^(Invalid state action foo)$/
                );
        });

    });

     describe('when there is a sessions_until_state metric', function() {

        beforeEach(function() {
            app.init = function() {
                metricsH = new MetricsHelper(app.im);
                metricsH
                    .add.sessions_until_state('states:test2', 'sessions_until')
                    .add.sessions_until_state('states:test2');
            };
        });

        it('should trigger the metric on entering the state', function() {
            return tester
                .inputs(null, 'test')
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions_until;
                    assert.deepEqual(metrics, {agg: 'avg', values: [ 1 ]});
                })
                .run();
        });

        it('should trigger both metrics', function() {
            return tester
                .inputs(null, 'test')
                .check(function(api, im, app) {
                    metric1 = api.metrics
                        .stores['metricsHelper-tester'].sessions_until;
                    metric2 = api.metrics
                        .stores['metricsHelper-tester'].sessions_until_state;
                    assert.deepEqual(metric1, {agg: 'avg', values: [ 1 ]});
                    assert.deepEqual(metric2, {agg: 'avg', values: [ 1 ]});
                })
                .run();
        });

        it('should trigger each time the state is reached', function() {
            return tester
                .inputs(null, 'test', null, 'test')
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions_until;
                    assert.deepEqual(metrics, {agg: 'avg', values: [ 1, 1 ]});
                })
                .run();
        });

        it('should count multiple sessions', function() {
            return tester
                .inputs(null, null, null, 'test', null, 'test')
                .check(function(api, im, app) {
                    metrics = api.metrics
                        .stores['metricsHelper-tester'].sessions_until;
                    assert.deepEqual(metrics, {agg: 'avg', values: [ 3, 1 ]});
                })
                .run();
        });

    });

});
