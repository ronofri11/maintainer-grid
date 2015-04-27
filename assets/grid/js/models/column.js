/*global define*/
define([
    "backbone",
    "../collections/cells"
], function (Backbone, Cells) {
    "use strict";

    var Column = Backbone.Model.extend({

        defaults: {
            index: 0,
            position: 0
        },

        initialize: function(){
            this.collection = new Cells();

            this.listenTo(this.collection, "cell:click", this.triggerEvent);
            this.listenTo(this.collection, "cell:mouseover", this.triggerEvent);
            this.listenTo(this.collection, "cell:mouseenter", this.triggerEvent);
            this.listenTo(this.collection, "cell:mousedown", this.triggerEvent);
            this.listenTo(this.collection, "cell:mousemove", this.triggerEvent);
            this.listenTo(this.collection, "cell:mouseup", this.triggerEvent);
        },

        triggerEvent: function(cellEvent){
            cellEvent["data"]["position"] = this.get("position");
            this.trigger(cellEvent["event"], cellEvent);
        },

        toDict: function(){
            return {
                index: this.get("index"),
                cells: this.collection.getCells()
            };
        }
    });

    return Column;
});
