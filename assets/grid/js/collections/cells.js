/*global define */
define([
    "backbone",
    "../models/cell"
], function (Backbone, Cell) {
    "use strict";

    var Cells = Backbone.Collection.extend({
        //Collection of models of type Cell
        model: Cell,

        getCells: function(){
            return this.map(function(cell){
                return cell.toDict();
            });
        },

        getCell: function(x, y){
            return this.where({"x": x, "y": y})[0];
        }
    });

    return Cells;
});
