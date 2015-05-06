/*global define*/
define([
    "backbone",
    "darwinstore/definition"
], function (Backbone, Definition) {
    "use strict";

    var Mapper = Backbone.Model.extend({

        getConfig: function(){
            var self = this;

            $.ajax({
                type: "GET",
                url: "js/json/configuration.json",
                dataType: "json"
            }).done(function(data){
                self.set("modelsDefinition", data);
                self.trigger("mapper:ready");
            });
        }
    });

    return Mapper;
});
