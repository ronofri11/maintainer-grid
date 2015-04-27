define([
    "backbone",
    "text!templates/legend.html",
], function (Backbone, legendTemplate) {
    "use strict";

    var LegendView = Backbone.View.extend({

        tagName: "li",

        className: "legend",

        template: _.template(legendTemplate),

        events: {
            "mouseenter": "logLegend"
        },

        initialize: function (options) {
            this.renderParams = options.renderParams;
            this.listenTo(this.model, "destroy", this.remove);
            this.listenTo(this.model, "removeView", this.remove);
            this.listenTo(this.model, "change:selected", this.setSelected);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));
            this.$el.css("height", (this.renderParams.height * (end - start)) + "px");
            this.$el.css("position", "absolute");
            this.$el.css("top", (this.renderParams.height * (start)) + "px");
            return this;
        },

        setSelected: function(){
            if(this.model.get("selected")){
                this.$el.addClass("pointer");
            }
            else{
                this.$el.removeClass("pointer");
            }
        },

        logLegend: function(){
            //console.log(this.model.get("x"), this.model.get("y"));
        }
    });

    return LegendView;
});
