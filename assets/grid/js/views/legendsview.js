/*global define*/
define([
    "backbone",
    "collections/legends",
    "views/legendview"
    //"text!templates/grid.html"
], function (Backbone, Legends, LegendView) {
    "use strict";

    //The overall Grid Component
    var LegendsView = Backbone.View.extend({

        tagName: "div",

        className: "legends",
        
        events: {
        },

        initialize: function (options) {
            this.selector = options.selector;
            this.renderParams = options.renderParams;
            this.$container = $(this.selector);
            this.collection = new Legends();

            this.listenTo(this.collection, "reset", this.render);
            this.listenTo(this.collection, "add", this.renderLegend);
            //this.listenTo(this.collection, "change", this.render);
        },

        render: function () {
            this.$el.empty();
            this.$el.css("height", this.renderParams.height + "px");

            this.collection.each(function(legend){
                legend.trigger("removeView");
                var view = new LegendView({model: legend, renderParams: this.renderParams});
                this.$el.append(view.render().el);
            }, this);

            this.$container.append(this.el);
        },

        renderLegend: function(legend){
            var view = new LegendView({model: legend, renderParams: this.renderParams});
            this.$el.append(view.render().el);
        },

        resetLegends: function(column){
            _.invoke(this.collection.toArray(), "destroy");
            this.collection.reset();
            for(var i in column){
                var cell = column[i];
                this.addLegend(cell);
            }
        },

        addLegend: function(cell){
            this.collection.add({
                "start": cell.start,
                "end": cell.end,
                "start_time": cell.start_time,
                "end_time": cell.end_time,
                "x": cell.x,
                "y": cell.y
            });
        },

        highlight: function(index){

            this.collection.each(function(legend) {
                legend.set({"selected": false});
            });

            var selectedLegend = this.collection.where({"y": index})[0];
            if(selectedLegend !== undefined){
                selectedLegend.set({"selected": true});
            }
        },

        clearHighlight: function(){
            this.collection.each(function(legend) {
                legend.set({"selected": false});
            });
        }
    });

    return LegendsView;
});
