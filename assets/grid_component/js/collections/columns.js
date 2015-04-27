/*global define */
define([
    "backbone",
    "../models/column"
], function (Backbone, Column) {
    "use strict";

    var Columns = Backbone.Collection.extend({
        //Collection of models of type Cell
        model: Column,

        getColumn: function(index){
            var column = this.where({"index": index})[0];
            if(column !== undefined){
                return column.toDict();
            }

            return {
                index: 0,
                cells:[]
            };
        },

        availableColumns: function(){
            return this.map(function(column){
                return column.get("index");
            });
        },

        getCell: function(x, y){

            var column = this.where({"index": x})[0];

            if(column !== undefined){
                var cell = column.collection.getCell(x, y);

                if(cell != undefined){
                    var cellData = cell.toDict();
                    cellData["position"] = column.get("position");
                    return cellData;
                }
            }

            return undefined;
        }
    });

    return Columns;
});
