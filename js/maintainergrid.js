define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../assets/grid_component/js/schedule",
    "../assets/store_component/js/store",
    "../assets/typeahead_component/js/typeahead"
], function (Marionette, Radio, Shim, ScheduleClass, StoreClass, TyConstructor) {

    var AppConstructor = function(channelName){
        var App = new Marionette.Application();
        App.Channel = Radio.channel(channelName);

        var OptionView = Marionette.ItemView.extend({
            tagName: "option",
            template: _.template('<%-nombre%>'),
            onRender: function(){
                this.$el.val(this.model.get("id"));
            }
        });

        var SelectView = Marionette.CollectionView.extend({
            tagName: "select",
            childView: OptionView,
            events: {
                "change": function(event){
                    App.Channel.trigger("selected:model:change", {
                        id: parseInt(this.$el.find("option:selected").val())
                    });
                }
            }
        });
        //this App works as the full maintainer component

        var storeConfigUrl = "/maintainer-grid/assets/store_component/js/json/configuration.json";
        var storeChannelName = channelName + "_store";

        App.Store = new StoreClass(storeChannelName, storeConfigUrl);

        var scheduleConfigUrl = "/clients/darwined/api_schedules";
        var scheduleChannelName = channelName + "_schedule";

        App.Schedule = new ScheduleClass(scheduleChannelName, scheduleConfigUrl);

        App.TypeAhead = new TyConstructor(channelName + "_ty");

        App.on("start", function(args){
            var SomeRegion = Marionette.Region.extend({});

            var someRegion = new SomeRegion({
                el: "#somediv"
            });

            var someOtherRegion = new SomeRegion({
                el: "#someotherdiv"
            });

            var storeChannel = Radio.channel(storeChannelName);
            var scheduleChannel = Radio.channel(scheduleChannelName);

            App.Channel.listenTo(scheduleChannel, "schedule:ready", function(){
                console.log("Schedule Loaded");
                var scheduleView = scheduleChannel.request("get:schedule:root");
                someRegion.show(scheduleView);
            });

            App.Channel.listenTo(storeChannel, "end:configuration", function(){
                console.log("Store ready for queries");
                App.Channel.command("fetch:models", {modelName: args.modelName});
            });

            App.setHandlers();
            
            App.Store.start({url:"/clients/darwined/"});
            App.Schedule.start({height: 300});



            App.Channel.on("models:loaded", function(){
                var DarwinCollection = storeChannel.request("get:collection:class", {modelName: args.modelName});
                
                App.Selection = new DarwinCollection();

                App.Models = App.Channel.request("get:models", {modelName: args.modelName});
                // if(App.Models.length > 0){
                //     App.Selection.add(App.Models.at(0));
                // }

                App.TypeAhead.start({
                    containerHeight: someOtherRegion.$el.outerHeight(),
                    models: App.Models,
                    separator: "__",
                    displayKeys: ["nombre","codigo"]
                });

                var tyChannel = App.TypeAhead.Channel;
                var tyView = tyChannel.request("get:typeahead:root");

                someOtherRegion.show(tyView);

                // App.Channel.command("change:selection");
            });
        });

        App.setHandlers = function(){
            var storeChannel = Radio.channel(storeChannelName);
            var scheduleChannel = Radio.channel(scheduleChannelName);
            var tyChannel = App.TypeAhead.Channel;

            App.Channel.comply("fetch:models", function(args){
                storeChannel.command("fetch:chain:for", {modelName: args.modelName});
            });
            App.Channel.listenTo(storeChannel, "store:model:loaded", function(args){
                App.Channel.trigger("models:loaded");
            });
            App.Channel.reply("get:models", function(args){
                var models = storeChannel.request("get:models", {modelName: args.modelName});
                return models;
            });

            App.Channel.listenTo(tyChannel, "selected:model:change", function(args){
                var newSelectedModel = args.model;
                var piecesArray = scheduleChannel.request("export:pieces");
                App.Selection.each(function(model){
                    model.set({"bloques": piecesArray});
                });

                App.Selection.reset([newSelectedModel]);
                App.Channel.command("change:selection");
            });

            App.Channel.comply("change:selection", function(){
                var model;
                if(App.Selection.length > 0){
                    model = App.Selection.at(0);
                    scheduleChannel.command("clean:pieces");
                    scheduleChannel.command("load:existent:pieces", {pieces: model.get("bloques")});
                }
            });
        };

        return App;
    };

    return AppConstructor;
});
