define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim",
    "../assets/grid_component/js/grid",
    "../assets/grid_component/js/piecedrawer",
    "../assets/grid_component/js/legends",
    "../assets/grid_component/js/headers"
  // "../assets/grid/js/views/gridview",
  // "../assets/grid/js/blockparser"
], function (Marionette, Radio, Shim, Grid, PieceDrawer, Legends, Headers) {

    //this App works as the full schedule component
    //including Grid, PieceDrawer, Headers and Legends.
	var App = new Marionette.Application();

    var RootView = Marionette.LayoutView.extend({
        template: "#schedule-layout-template",
        regions:{
            "group-pieces": ".col-right > .container > .group-pieces"
        },

        events: {
            "mousedown .sch": "mousedown",
            "mouseup .sch": "mouseup",
            "mouseleave .sch": "mouseleave",
            "keyup": "keyup",
            "keydown": "keydown"
        },

        mousedown: function(){
            App.Mousedown = true;
        },

        mouseup: function(){
            App.Mousedown = false;
        },

        mouseleave: function(){
            App.Mousedown = false;
            App.Channel.trigger("clear:highlight");
        },

        keyup: function(event){
            switch(event.which){
                case 16: //SHIFT
                    App.Channel.trigger("change:mode", {mode:"create"});
                    break;
                case 17: //CTRL
                    break;
                default:
                    // console.log(event.which);
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
                    // console.log(event.which);
            }
        }
    });

    var AppendableRegion = Marionette.Region.extend({
        attachHtml: function(view){
            this.$el.append(view.el);
        }
    });

    var PrependableRegion = Marionette.Region.extend({
        attachHtml: function(view){
            this.$el.prepend(view.el);
        }
    });

    App.on("before:start", function(options){
        App.Grid = Grid;
        App.PieceDrawer = PieceDrawer;
        App.Legends = Legends;
        
        App.Channel = Radio.channel("schedule");
        App.CreateMode = Radio.channel("schedule-create-mode");
        App.DeleteMode = Radio.channel("schedule-delete-mode");

        //App State data

        App.ActiveMode = App.CreateMode;
        App.Mousedown = false;
    });

    App.on("start", function(options){
        App.Layout = new RootView();
        // App.Layout.render();
        App.Grid.start({
            renderParams:{height: options.height}
        });
        
        var gridChannel = Radio.channel("grid");
        var gridView = gridChannel.request("get:grid:root");

        var renderParams = gridChannel.request("get:grid:params");

        renderParams["z"] = 3;

        App.PieceDrawer.start(renderParams);
        var pieceChannel = Radio.channel("piecedrawer");
        var pieceView = pieceChannel.request("get:piecedrawer:root");

        var defaultCells = gridChannel.request("get:column:first");
        App.Legends.start({
            renderParams: renderParams,
            defaultCells: defaultCells
        });

        var legendsChannel = Radio.channel("legends");
        var legendsView = legendsChannel.request("get:legends:root");


        App.Headers = Headers;
        var headers = gridChannel.request("get:column:headers");
        App.Headers.start({
            renderParams: renderParams,
            headers: headers
        });

        var headersChannel = Radio.channel("headers");
        var headersView = headersChannel.request("get:headers:root");

        App.setHandlers();
    });

    App.setHandlers = function(){
        var gridChannel = Radio.channel("grid");
        var pieceChannel = Radio.channel("piecedrawer");
        var headersChannel = Radio.channel("headers");
        var legendsChannel = Radio.channel("legends");

        var gridView = gridChannel.request("get:grid:root");
        var pieceView = pieceChannel.request("get:piecedrawer:root");
        var headersView = headersChannel.request("get:headers:root");
        var legendsView = legendsChannel.request("get:legends:root");

        var renderParams = gridChannel.request("get:grid:params");

        App.Layout.on("show", function(args){
            App.Layout.addRegions({
                "container": new AppendableRegion({el: ".col-right > .container"}),
                "col-left": new AppendableRegion({el: ".col-left"}),
                "col-right": new PrependableRegion({el: ".col-right"})
            });

            App.Layout.getRegion("col-left").show(legendsView);
            
            App.Layout.getRegion("col-right").show(headersView);

            var containerRegion = App.Layout.getRegion("container");
            containerRegion.$el.css("height", renderParams.height + "px");
            containerRegion.show(gridView);

            App.Layout.getRegion("group-pieces").show(pieceView);

            //JUST FOR TESTING PURPOSES

            $("#create").on("click", function(){
                App.Channel.trigger("change:mode", {mode: "create"});
            });

            $("#delete").on("click", function(){
                App.Channel.trigger("change:mode", {mode:"delete"});
            });
        });

        App.Channel.listenTo(gridChannel, "cell:click", function(args){
            App.ActiveMode.trigger("cell:click", args);
        });

        App.Channel.listenTo(gridChannel, "cell:mouseover", function(args){
            var activeColumn = gridChannel.request("get:column:at", args.model.toJSON());
            legendsChannel.command("set:cells", {cells: activeColumn});
            legendsChannel.command("set:highlight", args.model.toJSON());
            headersChannel.command("set:highlight", args.model.toJSON());
            App.ActiveMode.trigger("cell:mouseover", args);
        });

        App.Channel.listenTo(pieceChannel, "piece:click", function(args){
            App.ActiveMode.trigger("piece:click", args);
        });

        App.Channel.listenTo(pieceChannel, "piece:mouseover", function(args){
            var activeColumn = gridChannel.request("get:column:at", args.model.toJSON());
            legendsChannel.command("set:cells", {cells: activeColumn});
            legendsChannel.command("set:highlight", args.model.toJSON());
            headersChannel.command("set:highlight", args.model.toJSON());
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

        App.Channel.on("clear:highlight", function(){
            legendsChannel.command("clear:highlight");
            headersChannel.command("clear:highlight");
        });

        //Schedule API composed of replies, complies and on's

        App.Channel.reply("get:schedule:root", function(){
            return App.Layout;
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
    };

    return App;
});
