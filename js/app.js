define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim",
    "../assets/grid_component/js/grid"
    // "../assets/grid/js/views/gridview",
    // "../assets/grid/js/blockparser"
], function (Marionette, Radio, Shim, Grid) {

	var App = new Marionette.Application();

    App.Grid = Grid;


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

    console.log(App.Grid);

    return App;
});
