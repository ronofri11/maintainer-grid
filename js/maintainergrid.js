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
        var storeChannelName = "store";

        App.Store = new StoreClass(storeChannelName, storeConfigUrl);

        return App;
    };

    return AppConstructor;
});
