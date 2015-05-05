define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../js/gridparser",
    // "text!../templates/grid.html"
], function(Marionette, Radio, Shim, GridParser){
    var Grid = new Marionette.Application();

    Grid.Channel = Radio.channel("grid");

    var Parser = new GridParser();
    var gridData = Parser.parse("/clients/darwined/api_schedules");
    // var gridData = Parser.parse("/maintainer-grid/assets/grid_component/js/json/grid-itc.json");

    //set of models and collections needed
    var Cell = Backbone.Model.extend({});

    var Cells = Backbone.Collection.extend({
        model: Cell
    });

    var Column = Backbone.Model.extend({});

    var Columns = Backbone.Collection.extend({
        model: Column,

        getCell: function(code){
            var splitCode = code.split(".");
            var col = this.findWhere({"index":splitCode[0]});
            var cell;
            if(col !== undefined){
                var cell = col.get("cells").findWhere({"code": code});
            }
            return cell;
        }
    });

    //Views for the Grid App
    var CellView = Marionette.ItemView.extend({
        tagName: "li",
        template: _.template('<span><%-code%></span>'),
        events: {
            "click": "broadcastEvent",
            "mouseover": "broadcastEvent",
            "mouseenter": "broadcastEvent",
            "mousedown": "broadcastEvent",
            "mousemove": "broadcastEvent",
            "mouseup": "broadcastEvent"
        },

        onRender: function(){
            var height = this.options.renderParams.height;
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));

            this.$el.css("height", (height * (end - start)) + "px");
            this.$el.css("top", (height * (start)) + "px");
            this.$el.css("position", "absolute");
        },

        bubbleEvent: function(event){
            var eventName = "cell:" + event.type;
            this.triggerMethod(eventName, {eventName: eventName, model: this.model});
        },

        broadcastEvent: function(event){
            var eventName = "cell:" + event.type;
            Grid.Channel.trigger(eventName, {eventName: eventName, model: this.model});
        }
    });

    //replace with a CompositeView in case of a more complex scenario
    var ColumnView = Marionette.CollectionView.extend({
        tagName: "ul",
        className: "col",
        childView: CellView,

        // childEvents: {
        //     "cell:click": "bubbleEvent",
        //     "cell:mouseover": "bubbleEvent",
        //     "cell:mouseenter": "bubbleEvent",
        //     "cell:mousedown": "bubbleEvent",
        //     "cell:mousemove": "bubbleEvent",
        //     "cell:mouseup": "bubbleEvent"
        // },

        initialize: function(options){
            this.collection = this.model.get("cells");
            this.childViewOptions = {
                renderParams: options.renderParams
            };
        },

        onRender: function(){
            this.$el.css("width", this.options.renderParams.width + "%");
            this.$el.css("height", this.options.renderParams.height + "px");
        },

        bubbleEvent: function(emitter, args){
            // console.log("in column bubbling cell:", args);
            this.triggerMethod(args.eventName, args);
        }
    });

    var GridView = Marionette.CollectionView.extend({
        tagName: "div",
        className: "grid",
        childView: ColumnView,

        initialize: function(options){
            this.childViewOptions = {
                renderParams: options.renderParams
            };

            this.on("grid:click", this.gridClick);
        },

        onRender: function(){
            this.$el.css("height", this.options.renderParams.height + "px");
        }
    });

    Grid.on("before:start", function(options){
        // console.log("before:start");
        //options.columns should contain an array of objects
        //with a key named cells, and a 
        Grid.Columns = new Columns(gridData.columns);
        Grid.Columns.each(function(col){
            var cells = col.get("cells");
            var cellCollection = new Cells(cells);
            col.set("cells", cellCollection);
        });
    });

    Grid.on("start", function(options){
        // console.log("start");
        // console.log(options.renderParams.height);

        Grid.View = new GridView({
            collection: Grid.Columns,
            renderParams: {
                height: options.renderParams.height,
                width: parseFloat(100.0/Grid.Columns.length)
            }
        });
    });

    //Grid publishes it's DOM events on the "grid" channel
    Grid.Channel.on("cell:click", function(args){
        // console.log("channel:", Grid.Channel.channelName, args.model.toJSON());
    });

    //Grid exposes an API through it's channel
    Grid.Channel.reply("get:cell", function(args){
        var code = args.code;
        var cell = Grid.Columns.getCell(code);
        // console.log("cell is:", cell.toJSON());
        return cell;
    });

    Grid.Channel.reply("get:grid:params", function(){
        return Grid.View.getOption("renderParams");
    });

    Grid.Channel.reply("get:grid:root", function(){
        return Grid.View;
    });

    Grid.Channel.reply("get:column:first", function(){
        return Grid.Columns.at(0).get("cells").toArray();
    });

    Grid.Channel.reply("get:column:at", function(args){
        var col = Grid.Columns.findWhere({"index": "" + args.x});
        if(col !== undefined){
            return col.get("cells").toArray();
        }
        return [];
    });

    Grid.Channel.reply("get:column:headers", function(){
        var headers = [
            {"index": 1, "caption": "Lunes"},
            {"index": 2, "caption": "Martes"},
            {"index": 3, "caption": "Miércoles"},
            {"index": 4, "caption": "Jueves"},
            {"index": 5, "caption": "Viernes"},
            {"index": 6, "caption": "Sábado"},
            {"index": 7, "caption": "Domingo"}
        ]

        var availableHeaders = [];

        _.each(headers, function(header){
            if(Grid.Columns.findWhere({"index": "" + header.index}) !== undefined){
                availableHeaders.push(header);
            }
        });

        return availableHeaders;
    });

    return Grid;
});
