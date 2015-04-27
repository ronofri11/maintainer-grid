/*global define */
define([
    "backbone",
    "models/legend"
], function (Backbone, Legend) {
    "use strict";

    var Legends = Backbone.Collection.extend({
        //Collection of models of type Cell
        model: Legend
    });

    return Legends;
});
