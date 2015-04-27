define([
    "backbone",
    // "text!templates/cell.html",
], function (Backbone) {
    "use strict";

    var CellView = Backbone.View.extend({

        tagName: "li",

        template: _.template('<span></span>'),

        // Events related to the interaction with Cells, like clicking into an empty cell
        events: {
            "click": "triggerEvent",
            "mouseover": "triggerEvent",
            "mouseenter": "triggerEvent",
            "mousedown": "triggerEvent",
            "mousemove": "triggerEvent",
            "mouseup": "triggerEvent"
        },

        // Adding listeners to Cell Model events <-> Cell View events
        initialize: function (options) {
            this.renderParams = options.renderParams;
            this.listenTo(this.model, "destroy", this.removeView);
        },

        // Render the Cell object
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));
            this.$el.css("height", (this.renderParams.height * (end - start)) + "px");
            this.$el.css("top", (this.renderParams.height * (start)) + "px");
            this.$el.css("position", "absolute");
            return this;
        },

        triggerEvent: function(event){
            event.preventDefault();
            var cell = this.model.toDict();
            var eventName = "cell:" + event.type;
            var cellEvent = {"data": cell, "event": eventName};
            this.model.trigger(eventName, cellEvent);
        },

        removeView: function(){
            this.unbind();
            this.remove();
        }

    });

    return CellView;
});
