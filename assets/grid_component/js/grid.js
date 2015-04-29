define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../js/gridparser"
    // "text!../templates/grid.html"
], function(Marionette, Radio, Shim, GridParser){
    var Grid = new Marionette.Application();

    Grid.Channel = Radio.channel("grid");

    var Parser = new GridParser();
    var gridData = Parser.parse("/clients/darwined/api_schedules");
    console.log("gridData:", gridData);

    //set of models and collections needed
    var Cell = Backbone.Model.extend({});

    var Cells = Backbone.Collection.extend({
        model: Cell
    });

    var Column = Backbone.Model.extend({
    });

    var Columns = Backbone.Collection.extend({
        model: Column
    });

    //Views for the Grid App
    var CellView = Marionette.ItemView.extend({
        tagName: "li",
        template: _.template('<span><%-code%></span>'),
        triggers: {
            "click": "cell:click",
            "mouseover": "cell:mouseover",
            "mouseenter": "cell:mouseenter",
            "mousedown": "cell:mousedown",
            "mousemove": "cell:mousemove",
            "mouseup": "cell:mouseup"
        },

        onRender: function(){
            var height = this.options.renderParams.height;
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));

            this.$el.css("height", (height * (end - start)) + "px");
            this.$el.css("top", (height * (start)) + "px");
            this.$el.css("position", "absolute");
        }
    });

    //replace with a CompositeView in case of a more complex scenario
    var ColumnView = Marionette.CollectionView.extend({
        tagName: "ul",
        className: "col",
        childView: CellView,

        childEvents: {
            "cell:click": function(args){
                console.log("en el column", args);
                            this.triggerMethod("column:click", args);
                        }
        },

        initialize: function(options){
            this.collection = this.model.get("cells");
            this.childViewOptions = {
                renderParams: options.renderParams
            };
        },

        onRender: function(){
            this.$el.css("width", this.options.renderParams.width + "%");
            this.$el.css("height", this.options.renderParams.height + "px");
        }
    });

    var GridView = Marionette.CollectionView.extend({
        tagName: "div",
        className: "grid",
        childView: ColumnView,

        childEvents:{
            "column:click": function(args){
                console.log(args.model);
            }
        },

        initialize: function(options){
            this.childViewOptions = {
                renderParams: options.renderParams
            };

            this.on("grid:click", this.gridClick);
        },

        onRender: function(){
            this.$el.css("height", this.options.renderParams.height + "px");
        },

        gridClick: function(args){
            console.log(args);
            alert("grid clicked");
        }
    });

    var GridLayout = Marionette.LayoutView.extend({
        template: "#grid-layout-template",
        regions: {
            grid: ".container"
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

        Grid.Layout = new GridLayout();
    });

    Grid.on("start", function(){
        console.log("start");
        //first render is different from the ones to follow
        Grid.Layout.render();
        Grid.Layout.on("show", function(){
            Grid.Layout.getRegion("grid").show(new GridView({
                collection: Grid.Columns,
                renderParams: {
                    height: 410,
                    width: parseFloat(100.0/Grid.Columns.length)
                }
            }));
        });
    });

    return Grid;
});
