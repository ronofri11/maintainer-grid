define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim"
], function (Marionette, Radio, Shim) {

    var AppConstructor = function(channelName){
        //this App works as the full maintainer component
        var App = new Marionette.Application();
        App.Channel = Radio.channel(channelName);

        return App;
    };

    return AppConstructor;
});
