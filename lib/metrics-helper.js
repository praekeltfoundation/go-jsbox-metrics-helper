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

            Adds a sum metric fires everytime a new session is started with a
            new user.

            :param string label:
                The label to store the total under in the metrics store.
        */
        self.im.on('user user:new', function(e) {
            return e.user.im.metrics.fire.sum(label, 1);
        });
        return self;
    };

});

this.MetricsHelper = MetricsHelper;