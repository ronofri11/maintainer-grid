define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim",
    "../assets/grid_component/js/grid",
    "../assets/grid_component/js/piecedrawer",
    "../assets/grid_component/js/legends"
  // "../assets/grid/js/views/gridview",
  // "../assets/grid/js/blockparser"
], function (Marionette, Radio, Shim, Grid, PieceDrawer, Legends) {

    //this App works as the full schedule component
    //including Grid, PieceDrawer, Headers and Legends.
	var App = new Marionette.Application();

    App.Mousedown = false;

    var RootView = Marionette.LayoutView.extend({
        el: "body",
        template: "#schedule-layout-template",
        regions:{
            "day-titles": ".col-right > .title",
            "group-pieces": ".col-right > .container > .group-pieces"
        },

        events: {
            "mousedown .sch": "mousedown",
            "mouseup .sch": "mouseup",
            "mouseleave .sch": "mouseup",
            "keyup": "keyup",
            "keydown": "keydown"
        },

        mousedown: function(){
            App.Mousedown = true;
        },

        mouseup: function(){
            App.Mousedown = false;
        },

        keyup: function(event){
            switch(event.which){
                case 16: //SHIFT
                    App.Channel.trigger("change:mode", {mode:"create"});
                    break;
                case 17: //CTRL
                    break;
                default:
                    console.log(event.which);
            }
        },

        keydown: function(event){
            switch(event.which){
                case 16: //SHIFT
                    App.Channel.trigger("change:mode", {mode:"delete"});
                    break;
                case 17: //CTRL
                    break;
                default:
                    console.log(event.which);
            }
        }
    });

    App.Layout = new RootView();
    App.Layout.render();

    var AppendableRegion = Marionette.Region.extend({
        attachHtml: function(view){
            this.$el.append(view.el);
        }
    });

    App.Layout.addRegions({
        "container": new AppendableRegion({el: ".col-right > .container"}),
        "col-left": new AppendableRegion({el: ".col-left"})
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
        renderParams:{height: 410}
    });

    var gridChannel = Radio.channel("grid");
    var gridView = gridChannel.request("get:grid:root");

    var renderParams = gridChannel.request("get:grid:params");

    var containerRegion = App.Layout.getRegion("container");
    containerRegion.$el.css("height", renderParams.height + "px");
    containerRegion.show(gridView);

    renderParams["z"] = 3;
    console.log("renderParams", renderParams);

    App.PieceDrawer = PieceDrawer;
    App.PieceDrawer.start(renderParams);

    App.Legends = Legends;
    var defaultCells = gridChannel.request("get:first:column");
    App.Legends.start({
        renderParams: renderParams,
        defaultCells: defaultCells
    });

    var legendChannel = Radio.channel("legends");
    var legendView = legendChannel.request("get:legends:root");

    App.Layout.getRegion("col-left").show(legendView);

    var pieceChannel = Radio.channel("piecedrawer");
    var pieceView = pieceChannel.request("get:piecedrawer:root");

    App.Layout.getRegion("group-pieces").show(pieceView);

    App.CreateMode = Radio.channel("create-mode");
    App.DeleteMode = Radio.channel("delete-mode");

    App.ActiveMode = App.CreateMode;

    App.Channel = Radio.channel("global");

    App.Channel.listenTo(gridChannel, "cell:click", function(args){
        App.ActiveMode.trigger("cell:click", args);
    });

    App.Channel.listenTo(gridChannel, "cell:mouseover", function(args){
        App.ActiveMode.trigger("cell:mouseover", args);
    });

    App.Channel.listenTo(pieceChannel, "piece:click", function(args){
        App.ActiveMode.trigger("piece:click", args);
    });

    App.Channel.listenTo(pieceChannel, "piece:mouseover", function(args){
        App.ActiveMode.trigger("piece:mouseover", args);
    });

    App.Channel.on("change:mode", function(args){
        switch(args.mode){
            case "delete":
                App.ActiveMode = App.DeleteMode;
                break;
            default:
                App.ActiveMode = App.CreateMode;
        }
    });

    //Demultiplexers

    App.CreateMode.on("cell:click", function(args){
        pieceChannel.command("draw:piece", args.model.toJSON());
    });

    App.CreateMode.on("cell:mouseover", function(args){
        if(App.Mousedown){
            pieceChannel.command("draw:piece", args.model.toJSON());
        }
    });

    App.CreateMode.on("piece:click", function(args){
        pieceChannel.command("draw:piece", args);
    });

    App.CreateMode.on("piece:mouseover", function(args){
        if(App.Mousedown){
            pieceChannel.command("draw:piece", args);
        }
    });

    App.DeleteMode.on("piece:click", function(args){
        pieceChannel.command("delete:piece", args);
    });

    App.DeleteMode.on("piece:mouseover", function(args){
        if(App.Mousedown){
            pieceChannel.command("delete:piece", args);
        }
    });

    //JUST FOR TESTING PURPOSES

    var state = "create";

    $("#boton").on("click", function(){
        var mode;
        if(state === "create"){
            state = "delete";
        }
        else{
            state = "create";
        }
        App.Channel.trigger("change:mode", {mode: state});
    });

    return App;
});
