/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";
    var Definition = Backbone.Model.extend({
        idAttribute: 'name',
        defaults: {
            name: null,
            collectionName: null,
            urlRoot: null,
            deps: []
        }
    });

    return Definition;
});
