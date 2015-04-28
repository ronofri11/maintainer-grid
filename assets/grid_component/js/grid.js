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
    var gridData = Parser.parse("/maintainer-grid/assets/grid/js/json/servicio_jony.json");
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
        onRender: function(){
            var height = this.options.renderParams.height;
            var start = parseFloat(this.model.get("start"));
            var end = parseFloat(this.model.get("end"));

            this.$el.css("height", (height * (end - start)) + "px");
            this.$el.css("top", (height * (start)) + "px");
            this.$el.css("position", "absolute");
        }
    });

    var ColumnView = Marionette.CompositeView.extend({
        tagName: "ul",
        className: "col",
        template: _.template('<h3>column:<%-index%>   </h3>'),
        childView: CellView,

        initialize: function(options){
            this.collection = this.model.get("cells");
            this.childViewOptions = {
                renderParams: options.renderParams
            };
        },

        onRender: function(){
            this.$el.css("width", this.options.renderParams.width + "%");
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
