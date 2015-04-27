/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";

    var Legend = Backbone.Model.extend({
        defaults: {
            start: 0.0,
            end: 0.5,
            start_time: "",
            end_time: "",
            x: 1,
            y: 1,
            selected: false
        }
    });

    return Legend;
});
