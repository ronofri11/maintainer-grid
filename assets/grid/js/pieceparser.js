define([
    "jquery"
], function ($) {

    var Parser = function(){};

    Parser.prototype.getData = function (url){
        var pieces = {"pieces": []};
        $.ajax({
            dataType: "json",
            url: url,
            async: false,
            success: function(result){
                pieces = result;
            }
        });
        return pieces;
    };


    Parser.prototype.parseDict = function(pieces){

        var piecesParsed = {"pieces": []};

        for(var p in pieces){
            var x = pieces[p]["day"];
            var y = pieces[p]["module"];
            var data = pieces[p]["data"];
            var state = pieces[p]["state"];

            piecesParsed["pieces"].push({x:x, y:y, data: data, state: state});
        }

        return piecesParsed;
    };

    Parser.prototype.parse = function(url){

        var pieces = this.getData(url);
        var piecesParsed = {"pieces": []};

        return this.parseDict(pieces["pieces"]);
    };

    return Parser;
});
