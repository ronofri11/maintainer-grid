define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim"
], function(Marionette, Radio, Shim){
    var Legends = new Marionette.Application();

    Legends.Channel = Radio.channel("grid");

    //set of models and collections needed
    var Legend = Backbone.Model.extend({});

    var LegendCollection = Backbone.Collection.extend({
        model: Legend
    });

    //Views for the Grid App
    var LegendView = Marionette.ItemView.extend({
        tagName: "li",
        className: "legend",
        template: _.template('<span><%-start_time%> - <%-end_time%></span>'),
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
            console.log("in column bubbling cell:", args);
            this.triggerMethod(args.eventName, args);
        }
    });

    Grid.on("before:start", function(options){
        console.log("before:start");
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
        console.log("start");
        console.log(options.renderParams.height);

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
        console.log("channel:", Grid.Channel.channelName, args.model.toJSON());
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

    return Grid;
});
