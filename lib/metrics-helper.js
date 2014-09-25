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

    self.add.total_state_actions = function(state, label) {
        /** MetricsHelper.add.total_state_actions(state, label)

            Adds an inc metric that fires every time the specified state action
            is triggered.

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
        var action = (typeof state.action === 'undefined'?'enter':state.action)
            .match(/(enter|exit|input|resume|show)/i);
        try {
            action = action[0].toLowerCase();
        } catch(e) {
            throw "Invalid state action " + state.action;
        }

        label = typeof label !== 'undefined' 
            ? label
            : ['total_action', 
               action, 
               state.state.replace(/[^a-zA-Z._]/g, '_')].join('_');

        self.im.on('state:' + action, function(e) {
            if(e.state.name === state.state) {
                return e.state.im.metrics.fire.inc(label, 1);
            }
        });
        return self;
    };

});

this.MetricsHelper = MetricsHelper;