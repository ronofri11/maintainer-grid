/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";

    var Piece = Backbone.Model.extend({
        defaults: {
            start: 0.0,
            end: 0.1,
            enabled: true,
            state: "new",
            caption: "empty piece",
            color: 0,
            x: 0,
            y: 0,
            data: {}
        },

        toDict: function(){
            return {
                x: this.get("x"),
                y: this.get("y"),
                state: this.get("state")
            }
        }
    });

    return Piece;
});
