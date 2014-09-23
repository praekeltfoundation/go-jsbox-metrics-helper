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

            Adds a sum metric that fires everytime a new session is started
            with a new user.

            :param string label:
                The label for the metric. Defaults to ``unique_users``
        */
        label = typeof label !== 'undefined' ? label: 'unique_users';
        self.im.on('user user:new', function(e) {
            return e.user.im.metrics.fire.sum(label, 1);
        });
        return self;
    };

});

this.MetricsHelper = MetricsHelper;