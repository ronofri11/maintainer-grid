define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../js/gridparser"
    // "text!../templates/grid.html"
], function(Marionette, Radio, Shim, GridParser){
    var PieceDrawer = new Marionette.Application();

    PieceDrawer.Channel = Radio.channel("piecedrawer");

    //set of models and collections needed
    var Piece = Backbone.Model.extend({
        //piece should have attributes
        //"state", "enabled", "data"
        //"color"
    });

    var Pieces = Backbone.Collection.extend({
        model: Piece
    });

    //GOP stands for Group Of Pieces
    var GOP = Backbone.Model.extend({
        //GOP should have attributes:
        //"color", "index"
    });

    var GOPS = Backbone.Collection.extend({
        model: GOP
    });

    //should have a Piece as model
    var PieceView = Marionette.ItemView.extend({
        tagName: "div",
        template: _.template('<span></span>'),
        events: {
            "click": "broadcastEvent",
            "mouseover": "broadcastEvent",
            "mouseenter": "broadcastEvent",
            "mousedown": "broadcastEvent",
            "mousemove": "broadcastEvent",
            "mouseup": "broadcastEvent"
        },

        onRender: function(){
            var width = this.options.renderParams.width;
            var height = this.options.renderParams.height;
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));

            this.$el.css("height", (height * (end - start)) + "px");
            this.$el.css("top", (height * (start)) + "px");
            this.$el.css("position", "absolute");

            this.$el.css("width", width + "%");
            this.$el.css("left", (width * (this.model.get("index") - 1))+ "%");
            this.$el.css("height", (height * (end - start)) + "px");
            this.$el.css("top", (height * (start)) + "px");
            this.$el.css("position", "absolute");
            this.$el.css("z-index", this.renderParams.z);

            this.setState();
        },

        setState: function(){
            this.$el.removeClass("new");
            this.$el.removeClass("saved");
            this.$el.removeClass("deleted");

            this.$el.addClass(this.model.get("state"));
        },

        broadcastEvent: function(event){
            var eventName = "piece:" + event.type;
            PieceDrawer.Channel.trigger(eventName, {eventName: eventName, model: this.model});
        }
    });

    //should have a GOP as model
    var PiecesView = Marionette.CollectionView.extend({
        tagName: "div",
        className: "layer",
        childView: PieceView,

        initialize: function(options){
            this.collection = this.model.get("pieces");
            this.childViewOptions = {
                renderParams: options.renderParams
            };
        },

        onRender: function(){
            this.$el.addClass("l"+this.renderParams.z);
        }
    });

    var GOPSLayout = Marionette.LayoutView.extend({
        template: _.template('<div class="group-pieces"></div>'),
        regions: {
            grid: ".group-pieces"
        }
    });

    PieceDrawer.on("before:start", function(options){
        console.log("before:start");
        //options.columns should contain an array of objects
        //with a key named cells, and a 
        PieceDrawer.Pieces = new Pieces();
        // PieceDrawer.Pieces.each(function(col){
        //     var cells = col.get("cells");
        //     var cellCollection = new Cells(cells);
        //     col.set("cells", cellCollection);
        // });

        PieceDrawer.Layout = new GOPSLayout();
    });

    PieceDrawer.on("start", function(){
        console.log("start");
        //first render is different from the ones to follow
        PieceDrawer.Layout.render();
        PieceDrawer.Layout.on("show", function(){
            PieceDrawer.Layout.getRegion("group-pieces").show(new PiecesView({
                collection: PieceDrawer.Pieces,
                renderParams: {
                    height: options.renderParams.height,
                    width: options.renderParams.width,
                    z: options.renderParams.z
                }
            }));
        });
    });

    PieceDrawer.Channel.on("piece:click", function(args){
        console.log("channel:", PieceDrawer.Channel.channelName, args.model.toJSON());
    });

    // PieceDrawer.Channel.reply("get:cell", function(args){
    //     var code = args.code;
    //     var cell = Grid.Columns.getCell(code);
    //     console.log("cell is:", cell.toJSON());
    //     return cell;
    // });

    return PieceDrawer;
});
