define([
    "jquery"
], function ($) {

    var Parser = function(){};

    Parser.prototype.getData = function (url){
        var professors = {"professors": {}};
        $.ajax({
            dataType: "json",
            url: url,
            async: false,
            success: function(result){
                professors = result;
            }
        });
        return professors;
    };

    Parser.prototype.parse = function(url){

        var professors = this.getData(url);

        return professors;
    };

    return Parser;
});
