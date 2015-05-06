/*global define*/
define([
    "backbone",
    "darwinstore/mapper",
    "darwinstore/collections/definitions",
    "darwinstore/darwinstore",
    "darwinstore/darwinmodel",
    "darwinstore/collections/darwincollection"
], function (Backbone, Mapper, Definitions, DarwinStore, DarwinModel, DarwinCollection) {
    "use strict";

    var MapperView = Backbone.View.extend({
        initialize: function(options){
            this.base_url = options.baseUrl;
            this.model = new Mapper();
            this.listenTo(this.model, "mapper:ready", this.continueProcess);

        },

        init: function(){
            this.model.getConfig();
        },

        continueProcess: function(){
            this.definitions = new Definitions(this.model.get("modelsDefinition"));
            this.generateModelsDefinitions();
            this.generateModels();
        },

        generateModelsDefinitions: function(){
            // Generate Models and Collections based on definitions
            this.Darwin = {
                Definitions: this.definitions,
                Models: {},
                Collections: {},
                Extractors: {}
            };
        },

        generateModels: function(){
            var self = this;
            var base_url = self.base_url;

            var totalDefinitions = this.Darwin.Definitions.length;

            this.Darwin.Definitions.each(function(def){
                var modelName = def.get('name');
                var collectionName = def.get('collectionName');

                // console.log("definition:" + modelName, def);
                // Create a new Model class
                var model = DarwinModel.extend({
                    // URL root for this model
                    urlRoot: base_url + def.get('urlRoot')
                });

                // Backbone Collection
                var collection = DarwinCollection.extend({
                    url: base_url + def.get('urlRoot'),
                });

                var deps = def.get("deps");

                var extractor = function(darwinModel){

                    for(var d = 0; d < deps.length; d++){
                        switch(deps[d].nested){
                            case "dictionary_array":
                                var dictArray = darwinModel.get(deps[d].key);
                                var dictArrayIds = [];
                                if(dictArray !== undefined){
                                    for(var i = 0; i < dictArray.length; i++){
                                        var atr = {
                                            atributo_id: dictArray[i].atributo.get("id"),
                                            prioridad: dictArray[i].prioridad
                                        };
                                        dictArrayIds.push(atr);
                                    }
                                }
                                darwinModel.set(deps[d].lookup, dictArrayIds);
                                break;
                            case "array":
                                var array = darwinModel.get(deps[d].key);
                                var arrayIds = [];
                                if(array !== undefined){
                                    for(var i = 0; i < array.length; i++){
                                        arrayIds.push(array[i].get("id"));
                                    }
                                }
                                darwinModel.set(deps[d].lookup, arrayIds);
                                break;
                            default:
                                // console.log("darwinModel", darwinModel);
                                // console.log("dep lookup", deps[d].lookup);
                                // console.log("dep key", deps[d].key);
                                // console.log("dep completa", deps[d]);
                                darwinModel.set(deps[d].lookup,
                                    darwinModel.get(deps[d].key).get("id"));
                        }
                    }

                    return darwinModel.toJSON();
                };

                // Store in Darwin structure
                self.Darwin.Models[modelName] = model;
                self.Darwin.Collections[collectionName] = collection;
                self.Darwin.Extractors[modelName] = extractor;

            });

            this.store = new DarwinStore();

            this.listenTo(this.store, "store:ready", this.storeReady);
            this.listenTo(this.store, "store:fetch:complete", this.fetchComplete);
            this.listenTo(this.store, "store:dep:loaded", this.storeDependencyLoaded);
            this.listenTo(this.store, "store:dep:totalDep", this.totalDependencies);


            this.store.init(this.Darwin);

            // this.store.fetchChainFor('Sala');
            //this.store.fetchChainFor('Asignatura');
            // this.store.fetchChainFor('Profesor');
        },

        fetchModelsFor: function(query){
            this.store.fetchChainFor(query);
        },

        storeReady: function(){
            this.trigger("store:ready");
        },

        storeDependencyLoaded: function(data){
            this.trigger("store:dep:loaded", data);
        },

        totalDependencies: function(data){
            this.trigger("store:dep:totalDep", data);
        },

        fetchComplete: function(){
            this.trigger("store:fetch:complete");
        },

        queryStore: function(query){
            return this.store.getAttribute(query);
        },

        extractJSON: function(modelName, model){
            return this.store.extractors[modelName](model);
        },

        modelUrl: function(modelName){
            return this.store.getModelUrl(modelName);
        },

        getEmptyDarwinModel: function(modelName){
            var deps = this.store.getDependencyListFor(modelName);
            var simpleDeps = this.store.getImmediateDependenciesFor(modelName);
            // console.log("model:", modelName, "deps: ", deps);
            // console.log("model:", modelName, "simple deps: ", simpleDeps);

            //should have some default values defined in configuration JSON.
            //and should be accessed
            var emptyModel = new DarwinModel();

            // for(var d = 0; d < simpleDeps.length; d++){
            //     //with defaults according its type in simpleDeps[d].model
            //     var emptySubModel = new DarwinModel();
            //     emptyModel.set(simpleDeps[d].key, emptySubModel);
            // }

            return emptyModel;
        }

    });



    return MapperView;
});
