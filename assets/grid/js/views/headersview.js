/*global define*/
define([
    "backbone",
    "collections/headers",
    "views/headerview"
    //"text!templates/grid.html"
], function (Backbone, Headers, HeaderView) {
    "use strict";

    //The overall Grid Component
    var HeadersView = Backbone.View.extend({

        className: "title",

        events: {
        },

        initialize: function (options) {
            this.selector = options.selector;
            this.renderParams = options.renderParams;
            this.$el = $(this.selector);
            this.collection = new Headers();

            this.listenTo(this.collection, "reset", this.render);
            this.listenTo(this.collection, "add", this.renderHeader);
        },

        render: function () {
            // console.log("rendering headers");
            //console.log(this.collection.length);
            this.$el.empty();
            //this.$el.css("height", this.renderParams.height + "px");
            this.collection.each(function(header){
                header.trigger("removeView");
                var view = new HeaderView({model: header, renderParams: this.renderParams});
                this.$el.append(view.render().el);
            }, this);
        },

        renderHeader: function(header){
            var view = new HeaderView({model: header, renderParams: this.renderParams});
            this.$el.append(view.render().el);
        },

        resetHeaders: function(headers){
            _.invoke(this.collection.toArray(), "destroy");
            this.collection.reset();
            for(var i in headers){
                var header = headers[i];
                this.addHeader(header);
            }
        },

        addHeader: function(header){
            this.collection.add({
                "index": header.index,
                "caption": header.caption
            }, {silent: true});
        },

        highlight: function(index){

            //console.log(index);

            this.collection.each(function(header) {
                header.set({"selected": false});
            });

            var selectedHeader = this.collection.where({"index": index})[0];
            if(selectedHeader !== undefined){
                selectedHeader.set({"selected": true});
            }
        },

        clearHighlight: function(){
            this.collection.each(function(header) {
                header.set({"selected": false});
            });
        }
    });

    return HeadersView;
});
