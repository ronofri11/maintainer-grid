/*global define */
define([
    "backbone",
    "models/piece"
], function (Backbone, Piece) {
    "use strict";

    var Pieces = Backbone.Collection.extend({
        //Collection of models of type Piece
        model: Piece,

        deletePiece: function(x, y){
            var piece = this.where({"x": x, "y": y})[0];
            if(piece !== undefined){
                switch(piece.get("state")){
                    case "new":
                        piece.destroy();
                        break;
                    case "deleted":
                        //in case the piece appears as deleted, just do nothing
                        //piece.set({"state": "saved"});
                        break;
                    case "saved":
                        piece.set({"state": "deleted"});
                        break;
                }
            }
        },

        changeState: function(piece){
            //console.log(piece.get("state"));
            if(piece.get("state") == "deleted"){
                piece.set({"state": "saved"});
            }
        },

        getPiece: function(x, y){
            return this.where({"x": x, "y": y})[0];
        }
    });

    return Pieces;
});
