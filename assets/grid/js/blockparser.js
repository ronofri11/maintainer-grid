define([
    "jquery"
], function ($) {

    var Parser = function(){};

    Parser.prototype.getData = function (url){
        var blocks = {"grid": {}};
        $.ajax({
            dataType: "json",
            url: url,
            async: false,
            success: function(result){
                blocks = result;
            }
        });
        return blocks;
    };

    Parser.prototype.getLimits = function(blocks){

        if(!blocks.grid.length){
            return {};
        }

        var min = blocks["grid"][0]["start"];
        var max = blocks["grid"][0]["end"];

        for(var b in blocks["grid"]){
            var start = blocks["grid"][b]["start"];
            var end = blocks["grid"][b]["end"];
            if(min > start){
                min = start;
            }
            if(max < end){
                max = end;
            }
        }

        return {min: min, max: max};
    };

    Parser.prototype.getTime = function(strTime){
        var arrayTime = strTime.split(":");
        for(var i in arrayTime){
            arrayTime[i] = parseInt(arrayTime[i]);
        }

        return arrayTime;
    };

    Parser.prototype.absoluteTime = function(strTime){
        var arrayTime = this.getTime(strTime);
        var seconds = arrayTime[2];
        var minutes = arrayTime[1];
        var hours = arrayTime[0];

        return seconds + (60 * minutes) + (3600 * hours);
    };

    Parser.prototype.correctedTime = function(strTime1, strTime2){
        return this.absoluteTime(strTime2) - this.absoluteTime(strTime1);
    };

    Parser.prototype.parse = function(url){

        var blocks = this.getData(url);

        var limits = this.getLimits(blocks);

        var totalSeconds = this.correctedTime(limits.min, limits.max);
        var minSeconds = this.absoluteTime(limits.min);

        for(var b in blocks["grid"]){
            var start = blocks["grid"][b]["start"];
            var end = blocks["grid"][b]["end"];

            var arrayCode = blocks["grid"][b]["code"].split(".");

            blocks["grid"][b]["start_position"] = this.correctedTime(limits.min, start)/totalSeconds;
            blocks["grid"][b]["end_position"] = this.correctedTime(limits.min, end)/totalSeconds;
            blocks["grid"][b]["day"] = parseInt(arrayCode[0]);
            blocks["grid"][b]["module"] = parseInt(arrayCode[1]);

            var start_trimmed = start.split(":");
            var end_trimmed = end.split(":");

            blocks["grid"][b]["start"] = start_trimmed[0] + ":" + start_trimmed[1];
            blocks["grid"][b]["end"] = end_trimmed[0] + ":" + end_trimmed[1];
        }

        blocks["grid"].sort(function(b1, b2){
            return b1["day"] - b2["day"] || b1["module"] - b2["module"];
        });

        return blocks;
    };

    return Parser;
});
