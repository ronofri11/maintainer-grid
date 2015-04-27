/*global define */
define([
    "backbone",
    "models/header"
], function (Backbone, Header) {
    "use strict";

    var Headers = Backbone.Collection.extend({
        //Collection of models of type Cell
        model: Header
    });

    return Headers;
});
