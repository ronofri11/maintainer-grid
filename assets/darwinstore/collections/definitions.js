/*global define*/
define([
    "backbone",
    "darwinstore/definition"
], function (Backbone, Definition) {
    "use strict";

    var Definitions = Backbone.Collection.extend({
        model: Definition
    });

    return Definitions;
});
