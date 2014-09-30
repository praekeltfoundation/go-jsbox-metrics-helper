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

            Adds inc and sum metrics that fires every time a new session is 
            started with a new user.

            :param string label:
                The label for the metric. Defaults to ``unique_users``
        */
        label = typeof label !== 'undefined' ? label: 'unique_users';
        self.im.on('user user:new', function(e) {
            return e.user.im.metrics.fire.inc(label, 1).then(function() {
                return e.user.im.metrics.fire.sum(label + '.transient', 1);
            });
        });
        return self;
    };

    self.add.total_sessions = function(label) {
        /** MetricsHelper.add.total_sessions(label)

            Adds inc and sum metrics that fires every time a new session is
            started.

            :param string label:
                The label for the metric. Defaults to ``total_sessions``
        */
        label = typeof label !== 'undefined' ? label: 'total_sessions';
        self.im.on('session:new', function(e) {
            return e.im.metrics.fire.inc(label, 1).then(function() {
                return e.im.metrics.fire.sum(label + '.transient', 1);
            });
        });
        return self;
    };

    self._validate_state_action = function(action) {
        /*
        Validates that ``action`` is a valid state action. Throws an exception
        if it is not a valid state action.
        */
        formatted_action = (typeof action === 'undefined'?'enter':action)
            .match(/(enter|exit|input|resume|show)/i);
        try {
            return formatted_action[0].toLowerCase();
        } catch(e) {
            throw "Invalid state action " + action;
        }
    };

    self._create_metric_label = function(pre, action, state) {
        /*
        Creates a label ``$pre_$action_$state`` that is valid for a metric.
        */
        return [pre, action, state.replace(/[^a-zA-Z0-9._]/g, '_')]
                    .join('_').substring(0,100);
    };

    self.add.total_state_actions = function(state, label) {
        /** MetricsHelper.add.total_state_actions(state, label)

            Adds inc and sum metrics that fires every time the specified state
            action is triggered.

            :param object state:
                The name and action of the state to count actions for, e.g.
                
                .. code-block:: javascript

                {
                    state: 'states:foo',
                    action: 'exit'
                }

            :param string state.state:
                The name of the state to count the action for. Required.
            :param string state.action:
                The state action that should increment the count. Can be one of
                ``enter``, ``exit``, ``input``, ``resume``, and ``show``.
                Defaults to ``enter``.
            :param string label:
                The label for the metric. Defaults to 
                ``total_action_$ACTION_$STATE`` where ``$ACTION`` is the
                specified action, and ``$STATE`` is the name of the state with
                all characters that are not ``a-zA-Z._`` replaced with ``_``.
        */
        var action = self._validate_state_action(state.action);

        label = typeof label !== 'undefined' 
            ? label
            : self._create_metric_label('total_action', action, state.state);

        self.im.on('state:' + action, function(e) {
            if(e.state.name === state.state) {
                return e.state.im.metrics.fire.inc(label, 1).then(function() {
                    return e.state.im.metrics.fire.sum(label + '.transient', 1);
                });
            }
        });
        return self;
    };

    self._increment_metadata = function(user, label) {
    // Increments the specified metadata value
        var metadata = user.metadata;

        if (typeof metadata[label] === 'undefined'){
            metadata[label] = 0;
        }

        user.metadata[label] += 1;
    };

    self._reset_metadata = function(user, label) {
    // Gets the specified metadata value, resets to zero, and returns value.
    // If the value does not exist, sets the value to 0 and returns 0.
        if (typeof user.metadata[label] === 'undefined'){
            user.metadata[label] = 0;
            return 0;
        }

        var metadata_value = user.metadata[label];
        user.metadata[label] = 0;
        return metadata_value;
    };

    self._set_metadata = function(user, label, value) {
        user.metadata[label] = value;
    };

    self.add.sessions_until_state = function(state, label) {
        /** MetricsHelper.add.sessions_until_state(state, label)

            Adds an average metric that counts the amount of sessions
            taken to reach the specified state action.

            :param object state:
                The name and action of the state to count actions for, e.g.
                
                .. code-block:: javascript

                {
                    state: 'states:foo',
                    action: 'exit'
                }

            :param string state.state:
                The name of the state to count the action for. Required.
            :param string state.action:
                The state action that should increment the count. Can be one of
                ``enter``, ``exit``, ``input``, ``resume``, and ``show``.
                Defaults to ``enter``.
            :param string label:
                The label for the metric. Defaults to 
                ``sessions_until_$ACTION_$STATE`` where ``$ACTION`` is the
                specified action, and ``$STATE`` is the name of the state with
                all characters that are not ``a-zA-Z._`` replaced with ``_``.
        */
        var action = self._validate_state_action(state.action);
        label = typeof label !== 'undefined' 
            ? label
            : self._create_metric_label('sessions_until', action, state.state);
        var metadata_label = 'sessions_until_state_metric_' + label;

        self.im.on('session:new', function(e) {
            /* Increment sessions counter */
            self._increment_metadata(e.im.user, metadata_label);
        });

        self.im.on('state:' + action, function(e) {
            /* Reset sessions counter and fire metric */
            if(e.state.name === state.state) {
                var metadata_value = self._reset_metadata(
                    e.state.im.user, metadata_label);
                return e.state.im.metrics.fire.avg(label, metadata_value);
            }
        });

        return self;
    };

    self.add.time_between_states = function(state_from, state_to, label) {
        /** MetricsHelper.add.time_between_states(state_from, state_to, label)

            Adds an average metric that measures the amount of time taken
            between two state events. Metric stored as milliseconds.

            :param object state_from:
                The state where timing should start.
            :param object state_to:
                The state where timing should end.
            :param object state_*:
                The name and action of the state, e.g.

                .. code-block:: javascript

                {
                    state: 'states:foo',
                    action: 'exit'
                }

            :param string state_*.state:
                The name of the state. Required.
            :param string state_*.action:
                The state action. Can be one of ``enter``, ``exit``, ``input``,
                ``resume``, and ``show``. Defaults to ``enter``.
            :param string label:
                The label for the metric. Defaults to
                ``time_between_$ACTIONFROM_$STATEFROM_$ACTIONTO_$STATETO``
                where ``$ACTION_*`` is the specified action, and ``$STATE_*``
                is the name of the state with all characters that are not
                ``a-zA-Z._`` replaced with ``_``.
        */
        var from_action = self._validate_state_action(state_from.action);
        var to_action = self._validate_state_action(state_to.action);
        label = typeof label !== 'undefined'
            ? label
            : self._create_metric_label(
                'time_between', from_action, state_from.state) +
              self._create_metric_label('', to_action, state_to.state);
        var metadata_label = 'time_between_states_metric_' + label;

        self.im.on('state:' + from_action, function(e) {
            // Set timestamp
            if(e.state.name === state_from.state) {
                self._set_metadata(
                    e.state.im.user, metadata_label, Date.now());
            }
        });

        self.im.on('state:' + to_action, function(e) {
            // Fire metric with time difference
            if(e.state.name === state_to.state) {
                var time_from = self._reset_metadata(
                    e.state.im.user, metadata_label);
                return e.state.im.metrics.fire.avg(
                    label, Date.now() - time_from);
            }
        });

        return self;
    };

});

this.MetricsHelper = MetricsHelper;
