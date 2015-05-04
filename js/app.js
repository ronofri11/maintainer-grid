define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim",
    "../assets/grid_component/js/grid",
    "../assets/grid_component/js/piecedrawer"
  // "../assets/grid/js/views/gridview",
  // "../assets/grid/js/blockparser"
], function (Marionette, Radio, Shim, Grid, PieceDrawer) {

    //this App works as the full schedule component
    //including Grid, PieceDrawer, Headers and Legends.
	var App = new Marionette.Application();


    var RootView = Marionette.LayoutView.extend({
        el: "body",
        template: "#schedule-layout-template",
        regions:{
            "legends-title": ".col-left > .title",
            "legends-body": ".col-left > .legends",
            "day-titles": ".col-right > .title",
            "group-pieces": ".col-right > .container > .group-pieces"
        }
    });

    App.Layout = new RootView();
    App.Layout.render();

    var ContainerRegion = Marionette.Region.extend({
        el: ".col-right > .container",
        attachHtml: function(view){
            this.$el.append(view.el);
        }
    });

    App.Layout.addRegions({
        container: new ContainerRegion()
    });

    // var blockparser = new BlockParser();
    // var blocks = blockparser.parse("/maintainers/assets/grid/js/json/servicio_jony.json");

    // var channel = Radio.channel('global');
 //    console.log(channel);

    // App.Grid = App.module("Grid", function(Grid, App, Marionette, Radio, Shim){
    //     // alert("grid created");
    //     this.startWithParent = false;
    //     Grid.View = new GridView({selector:"#somediv", blocks: blocks["grid"]});

    // });

    // App.on("start", function(){
    //     console.log("App started!");
    //     var Grid = App.module("Grid");
    //     Grid.start();
    //     Grid.View.render();
    // });

    App.Grid = Grid;

    App.Grid.start({
        renderParams:{height: 350}
    });

    var gridChannel = Radio.channel("grid");
    var gridView = gridChannel.request("get:grid:root");

    var renderParams = gridChannel.request("get:grid:params");

    var containerRegion = App.Layout.getRegion("container");
    containerRegion.$el.css("height", renderParams.height + "px");
    containerRegion.show(gridView);

    renderParams["z"] = 1;
    console.log("renderParams", renderParams);

    App.PieceDrawer = PieceDrawer;
    App.PieceDrawer.start(renderParams);

    var pieceChannel = Radio.channel("piecedrawer");
    var pieceView = pieceChannel.request("get:piecedrawer:root");

    App.Layout.getRegion("group-pieces").show(pieceView);

    App.Channel = Radio.channel("global");

    App.Channel.listenTo(gridChannel, "cell:click", function(args){
        console.log("global channel:", args);

        pieceChannel.command("draw:piece", args);
    });

    return App;
});
