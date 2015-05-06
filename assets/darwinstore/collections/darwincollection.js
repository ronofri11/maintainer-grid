/*global define */
define([
    "backbone",
    "darwinstore/darwinmodel"
], function (Backbone, Row) {
    "use strict";

    var Rows = Backbone.Collection.extend({
        model: Row,

        initialize: function(){
            this.sortingMode = 1;
        },

        setWidths: function(index, widthDict){
            var row = this.at(index);
            if(row !== undefined){
                row.trigger("row:setWidths", widthDict);
            }
        },

        setWidthsAll: function(widthDict){
            for(var i = 0; i < this.length; i++){
                this.at(i).trigger("row:setWidths", widthDict);
            }
        },

        filterRows: function(filters){
            return this.filter(function(row){
                var relevant = true;
                $.each(filters, function(f, filter){
                    var key = filter.get("key");
                    var condition = filter.isRelevant(row.getNested(key));
                    relevant = relevant && condition;
                });

                return relevant;
            });
        },

        filterRowsByExternal: function(extFilters){

            var activeRows = this.filter(function(row){
                var relevant = extFilters.length === 0;
                for(var f = 0; f < extFilters.length; f++){
                    relevant = relevant || extFilters[f].filterModel(row);
                }
                return relevant;
            });

            return activeRows;
        },
        //receives the key by which the collection should be sorted
        //alternates between ascending and descending order.
        sortRows: function(sortModel){
            var key = sortModel.get("key");
            var sortingMode = sortModel.get("sort");
            var sortKey = sortModel.get("sortKey");

            this.comparator = function(row)
            {
                var value = row.getNested(key);
                if(!isNaN(parseFloat(value) && isFinite(value)))
                    return sortingMode * value;

                if(sortKey === undefined){
                    sortKey = key;
                }

                var str = row.fieldEncode(key, sortKey);
                str = str.toLowerCase();

                if(sortingMode !== 1){
                    str = str.split("");
                    str = _.map(str, function(letter) {
                        return String.fromCharCode(-(letter.charCodeAt(0)));
                    });
                }

                return str;
            };
            this.sort();
            sortModel.trigger("not:busy");
        },

        newRows: function(){
            return this.filter(function(row){
                return row.get("newRow") === true;
            });
        },

        deletedRows: function(){
            return this.filter(function(row){
                return row.get("deleted") === true;
            });
        },

        modifiedRows: function(){
            return this.filter(function(row){
                return (row.get("changed").length > 0) && !row.get("newRow") && !row.get("deleted");
            });
        },

        allRows: function(){
            return this.filter(function(row){
                return true;
            });
        },

        cleanDiff: function(successfulRows){
            // self = this;
            // _.each(successfulRows, function(row){
            //     console.log(row);
            //     console.log(row.id);
            //     var rowModel = self.get({"data": row.id});
            //     console.log(rowModel);
            //     rowModel.set("diff", []);
            // });

            this.each(function(row){
                row.trigger("row:resetChanges");
            });

            // this.trigger("rows:reload");
        }
    });

    return Rows;
});
