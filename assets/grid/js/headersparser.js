define([
    "jquery"
], function ($) {

    var Parser = function(){};

    Parser.prototype.getData = function (url){
        var headers = {"headers": []};
        $.ajax({
            dataType: "json",
            url: url,
            async: false,
            success: function(result){
                headers = result;
            }
        });
        return headers;
    };

    Parser.prototype.parse = function(url){

        var headers = this.getData(url);

        return headers;
    };

    return Parser;
});
