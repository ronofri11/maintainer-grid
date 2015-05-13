define([
    "backbone",
], function (Backbone) {

    var ScreedClasses = {};

    ScreedClasses.Editor = Backbone.Model.extend({});
    ScreedClasses.Editors = Backbone.Collection.extend({
        model: ScreedClasses.Editor
    });

    return ScreedClasses;
});
