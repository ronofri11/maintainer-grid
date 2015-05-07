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
    // "../assets/grid_component/js/schedule"
    "../assets/store_component/js/store"
], function (Marionette, Radio, Shim, App) {
    // var SomeRegion = Marionette.Region.extend({});

    // var someRegion = new SomeRegion({
    //     el: "#somediv"
    // });

    // var app = new App("schedule1", "/maintainer-grid/assets/grid_component/js/json/grid-blocks.json");

    // app.start({height: 300});

    // var appChannel = app.Channel;
    // var appView = appChannel.request("get:schedule:root");

    // someRegion.show(appView);

    // var someOtherRegion = new SomeRegion({
    //     el: "#someotherdiv"
    // });

    // var app2 = new App("schedule2", "/maintainer-grid/assets/grid_component/js/json/grid-itc.json");

    // app2.start({height: 200});

    // var app2Channel = app2.Channel;
    // var app2View = app2Channel.request("get:schedule:root");

    // someOtherRegion.show(app2View);

    // var div3 = new SomeRegion({
    //     el: "#div3"
    // });

    // var app3 = new App("schedule3", "/maintainer-grid/assets/grid_component/js/json/grid-uniminuto.json");

    // app3.start({height: 200});

    // var app3Channel = app3.Channel;
    // var app3View = app3Channel.request("get:schedule:root");

    // div3.show(app3View);

    var store = new App("store", "/maintainer-grid/assets/store_component/js/json/configuration.json");
    store.start({url:"/clients/darwined/"});
    window.Radio = Radio;

});
