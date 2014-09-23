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

    self.add.totalUniqueUsers = function(label) {
        /** MetricsHelper.add.totalUniqueUsers(label)

            Adds a sum metric that fires every time a new session is started
            with a new user.

            :param string label:
                The label for the metric.
        */
        self.im.on('user user:new', function(e) {
            return e.user.im.metrics.fire.sum(label, 1);
        });
        return self;
    };

    self.add.totalSessions = function(label) {
        /** MetricsHelper.add.totalUSSDSessions(label)

            Adds a sum metric that fires every time a new session is started.

            :param string label:
                The label for the metric.
        */
        self.im.on('session:new', function(e) {
            return e.im.metrics.fire.sum(label, 1);
        });
        return self;
    };

});

this.MetricsHelper = MetricsHelper;