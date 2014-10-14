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

Total Unique Users
------------------
For the function :func:`total_unique_users`, the following is an example of
using the function to add metrics to the basic function:

.. code-block:: javascript

    new MetricsHelper(self.im)
        .add.total_unique_users('unique_users');

This will add two new metrics; `unique_users`, a metric with a `last`
aggregation method that contains the current sum of unique users, and
`unique_users.transient`, a metric with the `sum` aggregration method that is
fired every time a new unique user accesses the service.

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
        "name": "Total new unique users over the past 30 days",
        "width": 12,
        "time_range": "30d",
        "bucket_size": "1d",
        "metrics": [
            {
                "name": "Unique Users",
                "target": {
                    "metric_type": "account",
                    "store": "teaorcoffee",
                    "name": "unique_users.transient",
                    "aggregator": "sum"
                }
            }
        ]
    }

The first widget will produce a text block with the total unique users over all
time, with a comparison to the value from one day ago.

The second widget will produce a line graph, showing the total unique users per
day for the last 30 days.

.. _`Vumi Go Dashboard documentation`: http://vumi-go.readthedocs.org/en/latest/dashboards.html
