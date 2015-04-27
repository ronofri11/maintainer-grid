/*global define*/
define([
    "backbone",
    "collections/pieces",
    "views/pieceview"
    //"text!templates/grid.html"
], function (Backbone, Pieces, PieceView) {
    "use strict";

    //The overall Grid Component
    var PiecesView = Backbone.View.extend({

        className: "layer",
        events: {
        },

        initialize: function (options) {
            this.selector = options.selector;
            this.renderParams = options.renderParams;
            this.$container = $(this.selector);
            this.collection = new Pieces();

            this.listenTo(this.collection, "add", this.renderPiece);
            this.listenTo(this.collection, "reset", this.renderPieces);
            this.listenTo(this.collection, "piece:mousemove", this.triggerEvent);
            this.listenTo(this.collection, "piece:click", this.triggerEvent);

        },

        render: function () {
            this.$el.addClass("l"+this.renderParams.z);
            
            this.$container.append(this.el);
        },

        renderPieces: function () {
            this.$el.addClass("l"+this.renderParams.z);
            
            this.collection.each(function(piece){
                var view = new PieceView({model: piece, renderParams: this.renderParams});
                this.$el.append(view.render().el);
            }, this);
            this.$container.append(this.el);
        },

        renderPiece: function(piece){
            var view = new PieceView({model: piece, renderParams: this.renderParams});
            this.$el.append(view.render().el);
        },

        drawPiece: function(params){
            var existentPiece = this.collection.getPiece(params.x, params.y);

            if(existentPiece === undefined){
                this.collection.add({
                    "caption": params.x + ", " + params.y,
                    "start": params.start,
                    "end": params.end,
                    "index": params.position,
                    "x": params.x,
                    "y": params.y,
                    "state": "new"
                });
            }

            else{
                if(existentPiece.get("state") != "new"
                    && existentPiece.get("state") != "saved"){
                    this.collection.changeState(existentPiece);
                }
            }
        },

        loadPiece: function(params){
            this.collection.add({
                "caption": params.x + ", " + params.y,
                "start": params.start,
                "end": params.end,
                "index": params.position,
                "x": params.x,
                "y": params.y,
                "state": params.state
            });
        },

        getPiecesJSON: function(){
            var result = { pieces: []};

            this.collection.each(function(piece){
                result.pieces.push({
                    day: piece.get("x"),
                    module: piece.get("y"),
                    data: piece.get("data"),
                    state: piece.get("state")
                });
            });

            return JSON.stringify(result);
        },

        getPieces: function(){
            var result = [];

            this.collection.each(function(piece){
                result.push({
                    day: piece.get("x"),
                    module: piece.get("y"),
                    data: piece.get("data"),
                    state: piece.get("state")
                });
            });

            return result;
        },

        triggerEvent: function(eventData){
            this.trigger(eventData["event"], eventData["data"]);
        },

        deletePiece: function(x, y){
            this.collection.deletePiece(x, y);
        },

        cleanPieces: function(){
            _.invoke(this.collection.toArray(), "destroy");
            //this.collection.reset();
        }
    });

    return PiecesView;
});
