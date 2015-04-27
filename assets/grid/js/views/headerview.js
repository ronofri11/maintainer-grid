define([
    "backbone",
    "text!templates/header.html",
], function (Backbone, headerTemplate) {
    "use strict";

    var HeaderView = Backbone.View.extend({

        tagName: "li",

        template: _.template(headerTemplate),

        events: {
        },

        initialize: function (options) {
            this.renderParams = options.renderParams;
            this.listenTo(this.model, "destroy", this.remove);
            this.listenTo(this.model, "removeView", this.removeView);
            this.listenTo(this.model, "change:selected", this.setSelected);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            if(this.renderParams !== undefined){
                this.$el.css("width", this.renderParams.width + "%");
            }

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

        removeView: function(){
            this.unbind();
            this.remove();
        }
    });

    return HeaderView;
});
