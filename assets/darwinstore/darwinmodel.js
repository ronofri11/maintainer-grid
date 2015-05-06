/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";

    var DarwinModel = Backbone.Model.extend({

        initialize: function(){
            this.set("property_separator", "__");
        },

        defaults: function(){
            return {
                changed: []
            };
        },
        
        toDict: function(){
            return this.toJSON();          
        },

        exportDict: function(columns){
            if(columns === undefined)
                return this;

            var result = {};

            // console.log("row", this);

            for(var c = 0; c < columns.length; c++){
                result[columns[c]] = this;
                var keys = columns[c].split(this.get("property_separator"));
                // console.log("keys", keys);
                for(var i = 0; i < keys.length; i++){
                    result[columns[c]] = result[columns[c]].get(keys[i]);
                    if(result[columns[c]] === undefined){
                        result[columns[c]] = null;
                        break;
                    }
                }
            }

            // console.log("row JSON", result);

            return result;
        },

        getNested: function(nestedKey){
            // console.log(nestedKey);
            var result = this;
            var keys = nestedKey.split(this.get("property_separator"));
            for(var i = 0; i < keys.length; i++){
                // console.log(keys[i]);
                result = result.get(keys[i]);
                if(result === undefined){
                    return null;
                }
            }
            return result;
        },

        getNestedDefault: function(nestedKey){
            return "";
        },

        setNested: function(nestedDict){
            //the nestedDict has a nestedKey and the new value
            var self = this;

            _.each(nestedDict, function(nestedValue, nestedKey){
                var property = self;
                var keys = nestedKey.split(self.get("property_separator"));
                
                var i = 0;
                while(i < keys.length - 1){
                    property = property.get(keys[i]);
                    i += 1;
                }
                property.set(keys[i], nestedValue);

                self.updateChanges();
            });
        },

        updateChanges: function(){
            var newChanged = _.clone(this.get("changed"));
            var modelChanged = Object.keys(this.changed);
            // console.log(modelChanged);
            for(var key in modelChanged){
                // console.log(modelChanged[key]);
                if(this.get("changed").indexOf(modelChanged[key]) === -1){
                    newChanged.push(modelChanged[key]);
                }
            }

            this.set("changed", newChanged);
        },

        fieldEncode: function(key, sortKey){
            var field = this.getNested(key);
            var code = "";

            switch(sortKey){
                case "list":
                    for(var i = 0; i < field.length; i++){
                        code += field[i]["atributo"].get("codigo");
                    }
                    break;
                case "grid":
                    for(var i = 0; i < field.length; i++){
                        code += field[i].get("nombre");
                    }
                    break;
                default:
            }

            if(field.constructor === Array){
                
                if(code === "")
                    code = "0";
                return code;
            }

            else {
                code = JSON.stringify(field);
                return code;
            }
        },

        deleteRow: function(){
            this.set("deleted", true);
            this.trigger("row:modified");
        }
    });

    return DarwinModel;
});
