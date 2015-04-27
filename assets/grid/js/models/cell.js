/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";

    var Cell = Backbone.Model.extend({
        // Default attributes for a Cell
        // each one should have coordinates "x" and "y"
        // a boolean enabled/disabled, and a possible state.
        defaults: {
            x: 0,
            y: 0,
            start: 0.0,
            end: 0.1,
            enabled: true,
            state: "default",
            start_time: "",
            end_time: ""
        },

        toDict: function(){
            return {
                start: this.get("start"),
                end: this.get("end"),
                x: this.get("x"),
                y: this.get("y"),
                index: this.get("x"),
                start_time: this.get("start_time"),
                end_time: this.get("end_time")
            };
        }
    });

    return Cell;
});
