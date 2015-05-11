define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../assets/grid_component/js/schedule",
    "../assets/store_component/js/store"
], function (Marionette, Radio, Shim, ScheduleClass, StoreClass) {

    var AppConstructor = function(channelName){
        //this App works as the full maintainer component
        var App = new Marionette.Application();
        App.Channel = Radio.channel(channelName);

        var storeConfigUrl = "/maintainer-grid/assets/store_component/js/json/configuration.json";
        var storeChannelName = channelName + "_store";

        App.Store = new StoreClass(storeChannelName, storeConfigUrl);

        App.on("before:start", function(options){
            var storeChannel = Radio.channel(storeChannelName);
            App.Channel.listenTo(storeChannel, "end:configuration", function(){
                console.log("Store ready for queries");
            });
        });

        App.on("start", function(options){
            App.Store.start({url:"/clients/darwined/"});
            App.setHandlers();
        });

        App.setHandlers = function(){
            var storeChannel = Radio.channel(storeChannelName);

            App.Channel.comply("fetch:models", function(args){
                storeChannel.command("fetch:chain:for", {modelName: args.modelName});
            });
            App.Channel.listenTo(storeChannel, "store:model:loaded", function(args){
                alert("Done fetching " + args.modelName);
            });
        };

        return App;
    };

    return AppConstructor;
});
