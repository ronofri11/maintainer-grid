define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim"
], function (Marionette, Radio, Shim) {

    var DarwinClasses = {};

    DarwinClasses.DarwinModel = Backbone.Model.extend({});
    DarwinClasses.DarwinCollection = Backbone.Collection.extend({
        model: DarwinClasses.DarwinModel
    });

    DarwinClasses.Definition = Backbone.Model.extend({
        idAttribute: "name",
        defaults: {
            name: null,
            collectionName: null,
            urlRoot: null,
            deps: []
        }
    });

    DarwinClasses.Definitions = Backbone.Collection.extend({
        model: DarwinClasses.Definition
    });

    return DarwinClasses;
});
