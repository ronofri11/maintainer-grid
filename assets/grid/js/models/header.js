/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";

    var Header = Backbone.Model.extend({
        defaults: {
            index: "legends",
            caption: "Horario",
            selected: false
        }
    });

    return Header;
});
