define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim"
], function(Marionette, Radio){
    var Grid = new Marionette.Application();

    Grid.View = new Marionette.CollectionView();

    return Grid;
});
