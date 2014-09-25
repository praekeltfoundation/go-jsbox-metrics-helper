var vumigo = require('vumigo_v02');
var events = vumigo.events;
var Eventable = events.Eventable;

var MetricsHelper = Eventable.extend(function(self, im) {
    /** class:MetricsHelper

    A helper for common metrics tasks.

    :param InteractionMachine im:
        The interaction machine that the metrics should be run on.

    */
    self.im = im;

    self.add = {};

    self.add.total_unique_users = function(label) {
        /** MetricsHelper.add.total_unique_users(label)

            Adds an inc metric that fires every time a new session is started
            with a new user.

            :param string label:
                The label for the metric. Defaults to ``unique_users``
        */
        label = typeof label !== 'undefined' ? label: 'unique_users';
        self.im.on('user user:new', function(e) {
            return e.user.im.metrics.fire.inc(label, 1);
        });
        return self;
    };

    self.add.total_sessions = function(label) {
        /** MetricsHelper.add.total_sessions(label)

            Adds an inc metric that fires every time a new session is started.

            :param string label:
                The label for the metric. Defaults to ``total_sessions``
        */
        label = typeof label !== 'undefined' ? label: 'total_sessions';
        self.im.on('session:new', function(e) {
            return e.im.metrics.fire.inc(label, 1);
        });
        return self;
    };

    self.add.total_state_entries = function(state, label) {
        /** MetricsHelper.add.total_state_entries(label)

            Adds an inc metric that fires every time the specified state is
            entered.

            :param string state:
                The name of the state to count entries for
            :param string label:
                The label for the metric. Defaults to ``total_state_entries``
        */
        label = typeof label !== 'undefined' ? label: 'total_state_entries';
        self.im.on('state:enter', function(e) {
            if(e.state.name === state) {
                return e.state.im.metrics.fire.inc(label, 1);
            }
        });
        return self;
    };

    self.add.total_state_exits = function(state, label) {
        /** MetricsHelper.add.total_state_exits(label)

            Adds an inc metric that fires every time the specified state is
            exited from.

            :param string state:
                The name of the state to count exits for
            :param string label:
                The label for the metric. Defaults to ``total_state_exits``
        */
        label = typeof label !== 'undefined' ? label: 'total_state_exits';
        self.im.on('state:exit', function(e) {
            if(e.state.name === state) {
                return e.state.im.metrics.fire.inc(label, 1);
            }
        });
        return self;
    };

    self.add.sessions_until_state = function(state, label) {
        /** MetricsHelper.add.sessions_until_state(state, label)

            Adds an average metric that counts the amount of sessions
            taken to reach the specified state.

            :param string state:
                The name of the state that should be reached.
            :param string label:
                The label for the metric. Defaults to ``sessions_until_state``
        */
        label = typeof label !== 'undefined' ? label: 'sessions_until_state';
        var m_label = 'sessions_until_state_metric_' + label;

        self.im.on('session:new', function(e) {
            var metadata = e.im.user.metadata;

            if (typeof metadata[m_label] === 'undefined'){
                metadata[m_label] = 0;
            }

            e.im.user.metadata[m_label] += 1;
            return e.im.user.save();
        });

        self.im.on('state:enter', function(e) {
            if(e.state.name === state) {
                m_value = e.state.im.user.metadata[m_label];
                e.state.im.user.metadata[m_label] = 0;
                return e.state.im.user.save().then(
                    e.state.im.metrics.fire.avg(label, m_value));
            }
        });

        return self;
    };

});

this.MetricsHelper = MetricsHelper;
