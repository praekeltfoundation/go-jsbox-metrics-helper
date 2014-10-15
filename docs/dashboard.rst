=========================
Configuring the dashboard
=========================

For the full documentation on dashboards within Vumi Go, please refer to the
`Vumi Go Dashboard documentation`_. This section of the documentation will
describe how to use each of the metrics helper functions in the context of
creating a Vumi Go dashboard.

Introduction
------------
For all of the following sections, it is assumed that the metrics are being
applied to this sample Vumi Go JavaScript Sandbox application:

.. code-block:: javascript

    var vumigo = require('vumigo_v02');
    var MetricsHelper = require('go-jsbox-metrics-helper');

    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;

    var SimpleApp = App.extend(function(self) {
        App.call(self, 'states:start');

        self.init = function() {
            new MetricsHelper(self.im);
            // Add metrics here
        };

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                question: 'Tea or coffee?',

                choices: [
                    new Choice('tea', 'Tea'),
                    new Choice('coffee', 'Coffee')],

                next: function(choice) {
                    return {
                        tea: 'states:tea',
                        coffee: 'states:coffee'
                    }[choice.value];
                }
            });
        });

        self.states.add('states:tea', function(name) {
            return new EndState(name, {
                text: 'Meh. Bye.',
                next: 'states:start'
            });
        });

        self.states.add('states:coffee', function(name) {
            return new EndState(name, {
                text: 'Cool :) Bye.',
                next: 'states:start'
            });
        });
    });

Total Unique Users and Sessions
-------------------------------
For the functions :func:`total_unique_users` and func:`total_sessions`, the 
following is an example of using the functions to add metrics to the basic
application:

.. code-block:: javascript

    new MetricsHelper(self.im)
        .add.total_unique_users('unique_users')
        .add.total_sessions('total_sessions');

This will add four new metrics; `unique_users`, a metric with a `last`
aggregation method that contains the current sum of unique users, and
`unique_users.transient`, a metric with the `sum` aggregation method that is
fired every time a new unique user accesses the service, `total_sessions` a
metric with the `last` aggregation method which will contain the total amount
of sessions, and `total_sessions.transient`, which is a metric with the `sum`
aggregation method which fires every time a new session is started.

The following is an example for use of these metrics in the Vumi Go Dashboard:

.. code-block:: javascript

    {
        "type": "diamondash.widgets.lvalue.LValueWidget",
        "name": "Total new unique users",
        "time_range": "1d",
        "target": {
            "metric_type": "account",
            "store": "teaorcoffee",
            "name": "unique_users",
            "aggregator": "last"
        }
    },
    {
        "type": "diamondash.widgets.graph.GraphWidget",
        "name": "Total sessions over the past 30 days",
        "width": 12,
        "time_range": "30d",
        "bucket_size": "1d",
        "metrics": [
            {
                "name": "Unique Users",
                "target": {
                    "metric_type": "account",
                    "store": "teaorcoffee",
                    "name": "total_sessions.transient",
                    "aggregator": "sum"
                }
            }
        ]
    }

The first widget will produce a text block with the total unique users over all
time, with a comparison to the value from one day ago.

The second widget will produce a line graph, showing the total new sessions per
day for the last 30 days.

Total State Actions and Sessions Until State
--------------------------------------------
The functions :func:`total_state_actions` and :func:`sessions_until_state` are
best invoked using the :func:`trigger` function. The following is an example of
using this function to add metrics to the basic application:

.. code-block:: javascript

    new MetricsHelper(self.im)
        .add.trigger({
            action: 'enter',
            state: 'states:tea'
        }, {
            total_state_actions: 'total_tea',
            sessions_until_state: 'sessions_per_tea'
        })

This will add three new metrics; `total_tea`, a metric with a `last`
aggregation method that contains the total amount of `enter` events on the
`states:tea` state; `total_tea.transient`, a metric with a `sum` aggregation
method that is fired every time the `enter` event on the `states:tea` state
is triggered; and `sessions_per_tea`, a metric with an `avg` aggregation
method, which is triggered every time the `enter` event of the `states:tea`
state is triggered, and contains the number of sessions taken to get to that
event.

The following is an example of using these metrics in a Vumi Go Dashboard:

.. code-block:: javascript

    {
        "type": "diamondash.widgets.lvalue.LValueWidget",
        "time_range": "1d",
        "name": "Total tea drinkers",
        "target": {
            "metric_type": "account",
            "store": "teaorcoffee",
            "name": "total_tea",
            "aggregator": "last"
        }
    },
    {
        "type": "diamondash.widgets.lvalue.LValueWidget",
        "time_range": "1d",
        "name": "Average sessions until tea is chosen",
        "target": {
            "metric_type": "account",
            "store": "teaorcoffee",
            "name": "sessions_per_tea",
            "aggregator": "avg"
        }
    },
    {
        "type": "diamondash.widgets.graph.GraphWidget",
        "name": "Weekly tea consumption for the last 30 days",
        "width": 12,
        "time_range": "30d",
        "bucket_size": "7d",
        "metrics": [{
            "name": "Tea",
            "target": {
                "metric_type": "account",
                "store": "teaorcoffee",
                "name": "total_tea.transient",
                "aggregator": "sum"
            }
        }]
    }

The first widget will create a text block showing the total amount of tea
drinkers, with a comparison to the total amount of tea drinkers from one day
ago.

The second widget will show the average amount of sessions taken to get to
the tea state, with a comparison to the amount from one day ago.

The last widget is a line graph that shows the amount of tea drinkers, grouped
by week, over the last 30 days.

.. _`Vumi Go Dashboard documentation`: http://vumi-go.readthedocs.org/en/latest/dashboards.html
