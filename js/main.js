"use strict";

require.config({
    paths : {
        backbone : "../bower_components/backbone/backbone",
        underscore : "../bower_components/underscore/underscore",
        jquery : "../bower_components/jquery/dist/jquery",
        "backbone.marionette" : "../bower_components/backbone.marionette/lib/core/backbone.marionette",
        "backbone.radio" : "../bower_components/backbone.radio/build/backbone.radio",
        "backbone.babysitter" : "../bower_components/backbone.babysitter/lib/backbone.babysitter",
        text: "../bower_components/requirejs-text/text"
    },
    enforceDefine: true,
    map: {
        '*': {
            'backbone.wreqr': 'backbone.radio'
        } 
    }
});

define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "app"
], function (Marionette, Radio, Shim, App) {
    var SomeRegion = Marionette.Region.extend({});

    var someRegion = new SomeRegion({
        el: "#somediv"
    });

    App.start({height: 500});

    var appChannel = Radio.channel("schedule");
    var appView = appChannel.request("get:schedule:root");

    someRegion.show(appView);

});
