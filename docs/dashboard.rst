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




.. _`Vumi Go Dashboard documentation`: http://vumi-go.readthedocs.org/en/latest/dashboards.html