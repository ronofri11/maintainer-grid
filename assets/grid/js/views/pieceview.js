define([
    "backbone",
    "text!templates/piece.html"
], function (Backbone, pieceTemplate) {
    "use strict";

    var PieceView = Backbone.View.extend({

        tagName: "div",

        className: "piece",

        template: _.template(pieceTemplate),

        events: {
            "click": "triggerEvent",
            "mousemove": "triggerEvent"
        },

        initialize: function (options) {
            this.renderParams = options.renderParams;
            this.listenTo(this.model, "destroy", this.removeView);
            this.listenTo(this.model, "change:color", this.setColor);
            this.listenTo(this.model, "change:state", this.setState);
        },

        removeView: function(){
            this.unbind();
            this.remove();
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));
            this.$el.css("width", this.renderParams.width + "%");
            this.$el.css("left", (this.renderParams.width * (this.model.get("index") - 1))+ "%");
            this.$el.css("height", (this.renderParams.height * (end - start)) + "px");
            this.$el.css("top", (this.renderParams.height * (start)) + "px");
            this.$el.css("position", "absolute");
            this.$el.css("z-index", this.renderParams.z);
            //this.$el.addClass("pColor16");
            this.setState();

            return this;
        },

        triggerEvent: function(event){
            event.preventDefault();
            var piece = this.model.toDict();
            var eventName = "piece:" + event.type;
            var pieceEvent = {"data": piece, "event": eventName};
            this.model.trigger(eventName, pieceEvent);
        },

        setState: function(){
            this.$el.removeClass("new");
            this.$el.removeClass("saved");
            this.$el.removeClass("deleted");

            this.$el.addClass(this.model.get("state"));
        }
    });

    return PieceView;
});
