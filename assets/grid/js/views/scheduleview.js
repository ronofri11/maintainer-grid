/*global define*/
define([
    "backbone",
    "views/gridview",
    "blockparser",
    "pieceparser",
    "headersparser",
    "views/piecesview",
    "views/legendsview",
    "views/headersview",
    "views/schedulenormalmode",
    "views/scheduledeletemode"
    //"text!templates/grid.html"
], function (
    Backbone,
    GridView,
    BlockParser,
    PieceParser,
    HeaderParser,
    PiecesView,
    LegendsView,
    HeadersView,
    NormalMode,
    DeleteMode) {
    "use strict";

    //The overall Grid Component
    var ScheduleView = Backbone.View.extend({

        el: ".sch",

        events: {
            "mouseup": "globalMouseUp",
            "mousedown": "globalMouseDown",
            "mouseleave .container": "setDefaults"
        },

        initialize: function (options) {

            var blockparser = new BlockParser();
            this.pieceparser = new PieceParser();
            var headerparser = new HeaderParser();

            var blocks = blockparser.parse("js/json/servicio_jony.json");
            //var pieces = this.pieceparser.parse("js/json/pieces.json");
            var dayTitles = headerparser.parse("js/json/headers.json");
            var legendsTitle = {"index": "legends", "caption": "Horario"};

            this.gridSelector = ".container";
            this.pieceDrawerSelector = ".group-pieces";
            this.HeadersSelector = "#title-days";
            this.LegendsSelector = ".col-left";

            this.grid = this.initGrid(blocks);

            this.availableDays = this.grid.getColumnsArray();
            this.totalDays = this.availableDays.length;

            this.pieceDrawer = this.initPieceDrawer();
            this.legendsview = this.initLegends();
            this.dayHeaders = this.initHeaders(dayTitles);

            this.legendHeaders = new HeadersView({selector: "#title-legends"});
            this.legendHeaders.addHeader(legendsTitle);

            this.normalMode = new NormalMode({
                grid: this.grid,
                pieceDrawer: this.pieceDrawer,
                legendsview: this.legendsview,
                dayHeaders: this.dayHeaders,
                model: this.model
            });

            this.deleteMode = new DeleteMode({
                grid: this.grid,
                pieceDrawer: this.pieceDrawer,
                legendsview: this.legendsview,
                dayHeaders: this.dayHeaders,
                model: this.model
            });

            this.normalMode.setHandlers();

            this.setDefaults();

        },

        render: function () {
            this.grid.render();
            this.pieceDrawer.render();
            this.legendsview.render();
            this.legendHeaders.render();
            this.dayHeaders.render();
        },

        initGrid: function(blocks){
            return new GridView({
                blocks: blocks["grid"],
                selector: this.gridSelector
            });
        },

        initPieceDrawer: function(){
            var pieceDrawer = new PiecesView({
                selector: this.pieceDrawerSelector,
                renderParams: {
                    width: this.grid.renderParams.width,
                    height: this.grid.renderParams.height,
                    z: 1
                }
            });

            return pieceDrawer;
        },

        initLegends: function(){
            return new LegendsView({
                selector: this.LegendsSelector,
                renderParams: {
                    height: this.grid.renderParams.height
                }
            });
        },

        initHeaders: function(titles){
            var headers = new HeadersView({
                selector: this.HeadersSelector,
                renderParams: {
                    width: this.grid.renderParams.width
                }
            });

            for(var day in this.availableDays){
                headers.addHeader(titles[this.availableDays[day]]);
            }

            return headers;
        },

        setDefaults: function(){
            this.setColumnLegends(this.availableDays[0]);
            this.dayHeaders.clearHighlight();
            this.legendsview.clearHighlight();
        },

        globalMouseUp: function(){
            this.model.set({"mousedown": false});
        },

        globalMouseDown: function(){
            this.model.set({"mousedown": true});
        },

        columnChange: function(column){
            this.legendsview.resetLegends(column["cells"]);
        },

        setColumnLegends: function(index){
            this.columnChange(this.grid.getColumn(index));
        },

        savePieces: function(){
            var jsonPieces = this.pieceDrawer.getPiecesJSON();
            console.log(jsonPieces);
            notificacion(1, "Atributos guardados exitosamente.", true);
        },

        populatePieces: function(pieces){
            for(var p in pieces["pieces"]){
                var queryCell = pieces["pieces"][p];
                var cellData = this.grid.getCell(queryCell);
                if(cellData !== undefined){
                    cellData.state = pieces["pieces"][p].state;
                    this.pieceDrawer.loadPiece(cellData);
                }
            }
        },

        changePieces: function(pieces){
            var newPieces = this.pieceparser.parseDict(pieces);
            this.pieceDrawer.cleanPieces();
            this.populatePieces(newPieces);
        },

        getWorkingPieces: function(){
            return this.pieceDrawer.getPieces();
        },

        setMode: function(mode){
            switch(mode){
                case "edit":
                    this.normalMode.setHandlers();
                    this.deleteMode.removeHandlers();
                    break;
                case "delete":
                    this.normalMode.removeHandlers();
                    this.deleteMode.setHandlers();
                    break;
            }
        }
    });

    return ScheduleView;
});
