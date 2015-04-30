define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim",
    "../assets/grid_component/js/grid",
    "../assets/grid_component/js/piecedrawer"
  // "../assets/grid/js/views/gridview",
  // "../assets/grid/js/blockparser"
], function (Marionette, Radio, Shim, Grid, PieceDrawer) {

	var App = new Marionette.Application();

    App.Grid = Grid;

    var RootView = Marionette.LayoutView.extend({
        el: "body"
    });

    App.Layout = new RootView();
    App.Layout.addRegion("main", "#somediv");

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

    App.Grid.start({
      renderParams:{height: 350}
    });

    App.Layout.getRegion("main").show(App.Grid.Layout);

    Radio.channel("grid").request("get:cell", {code: "1.1"});
    var renderParams = Radio.channel("grid").request("get:grid:params");

    renderParams["z"] = 2;

    console.log("renderParams", renderParams);

    var gridRegion = Radio.channel("grid").request("get:grid:region");

    App.PieceDrawer = PieceDrawer;
    App.PieceDrawer.start(renderParams);

    gridRegion.show(App.PieceDrawer.Layout);

    return App;
});
