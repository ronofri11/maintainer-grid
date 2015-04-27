/*global define*/
define([
    "backbone",
    "../views/cellview"
], function (Backbone, CellView) {
    "use strict";

    //The overall Grid Component
    var ColumnView = Backbone.View.extend({

        tagName: "ul",

        //template: _.template(""),

        events: {
            "mouseenter": "triggerEvent"
        },

        initialize: function (options) {
            this.renderParams = options.renderParams;
        },

        render: function () {
            this.$el.empty();
            this.$el.addClass("col").css({
                "width": this.renderParams.width+"%",
                "height": this.renderParams.height + "px"
            });
            this.model.collection.each(this.renderCell,this);
            return this;
        },

        renderCell: function (cell) {
            var view = new CellView({model: cell, renderParams: this.renderParams});
            this.$el.append(view.render().el);
        },

        triggerEvent: function(event){
            
            event.preventDefault();
            var column = this.model.toDict();
            var eventName = "column:" + event.type;
            var columnEvent = {"data": column, "event": eventName};

            this.model.trigger(eventName, columnEvent);
        }
    });

    return ColumnView;
});
