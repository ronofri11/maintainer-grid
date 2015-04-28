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

    console.log(App.Grid);

    console.log("APP GRID IS ABOUT TO START");

    App.Grid.start({columns: 
        [{
            index:1,
            cells:[
                {
                  "start": "08:30:00", 
                  "code": "1.1", 
                  "end": "09:10:00"
                }, 
                {
                  "start": "09:10:00", 
                  "code": "1.2", 
                  "end": "09:50:00"
                }, 
                {
                  "start": "10:00:00", 
                  "code": "1.3", 
                  "end": "10:40:00"
                }
            ]
        }, 
        {
            index:2,
            cells:[
                {
                  "start": "08:30:00", 
                  "code": "2.1", 
                  "end": "09:10:00"
                }, 
                {
                  "start": "09:10:00", 
                  "code": "2.2", 
                  "end": "09:50:00"
                }, 
                {
                  "start": "10:00:00", 
                  "code": "2.3", 
                  "end": "10:40:00"
                }
            ]
        }
        ]
    });

    console.log("APP GRID WAS STARTED");

    App.Layout.getRegion("main").show(App.Grid.Layout);

    return App;
});
