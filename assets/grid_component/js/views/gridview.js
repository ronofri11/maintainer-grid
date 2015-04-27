/*global define*/
define([
    "backbone",
    "../collections/columns",
    "../views/columnview",
    "../models/column"
    //"text!templates/grid.html"
], function (Backbone, Columns, ColumnView, Column) {
    "use strict";

    //The overall Grid Component
    var GridView = Backbone.View.extend({

        className: "grid",

        events: {
        },

        initialize: function (options) {
            //Parameters passed as an object when creating a new View
            this.collection = new Columns();

            this.listenTo(this.collection, "cell:click", this.triggerEvent);
            this.listenTo(this.collection, "cell:mouseenter", this.triggerEvent);
            this.listenTo(this.collection, "cell:mousedown", this.triggerEvent);
            this.listenTo(this.collection, "cell:mousemove", this.triggerEvent);
            this.listenTo(this.collection, "cell:mouseup", this.triggerEvent);

            this.listenTo(this.collection, "column:mouseenter", this.triggerEvent);

            this.selector = options.selector;

            this.blocks = options.blocks;

            var position_index = 1;

            console.log(this.blocks);

            for(var i in this.blocks){
                var cell = this.blocks[i];
                if(this.collection.where({"index": cell.day}).length < 1){
                    this.collection.add({"index": cell.day, "position": position_index});
                    position_index += 1;
                }

                this.collection.where({"index":cell.day})[0].collection.add(
                    {
                        "x": cell.day,
                        "y": cell.module,
                        "start": cell.start_position,
                        "end": cell.end_position,
                        "start_time": cell.start,
                        "end_time": cell.end
                    });
            }

            this.days = this.collection.length;

            this.$container = $(this.selector);
            this.renderParams = this.getRenderParams();

        },

        render: function () {
            this.$container = $(this.selector);
            this.$container.addClass("container");
            this.$el.empty();
            this.renderParams = this.getRenderParams();
            this.collection.each(this.renderColumn, this);
            this.$el.append(this.fragment);
            this.$container.append(this.el);
        },

        renderColumn: function (column) {
            var view = new ColumnView({ model: column, renderParams: this.renderParams});
            this.$el.append(view.render().el);
        },

        getRenderParams: function(){
            var width = parseFloat(100 / this.days);
            var height = parseFloat(this.$container.height());

            return {width: width, height: height};
        },

        getCell: function(coordinates){
            var x = coordinates.x;
            var y = coordinates.y;

            return this.collection.getCell(x, y);
        },

        getColumnsArray: function(){
            return this.collection.availableColumns();
        },

        getColumn: function(index){
            return this.collection.getColumn(index);
        },

        triggerEvent: function(eventData){
            this.trigger(eventData["event"], eventData["data"]);
        }
    });

    return GridView;
});
