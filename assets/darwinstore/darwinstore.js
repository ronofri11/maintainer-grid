/*global define*/
define([
    "backbone"
], function (Backbone) {
    "use strict";

    var DarwinStore = Backbone.Model.extend({

        init: function(darwin){
            this.definitions = darwin.Definitions;
            this.models = darwin.Models;
            this.collections = darwin.Collections;
            this.extractors = darwin.Extractors;

            // Build collections for each model
            this.definitions.each(function(definition){
                // console.log("defnition", definition);
                var modelName = definition.get('name'),
                    collectionName = definition.get('collectionName'),
                    collection = this.collections[collectionName];

                this.set(modelName, new collection());
            }, this);
            this.trigger("store:ready");
        },

        fetchChainFor: function(modelName) {
            var self = this;
            // First, get the chain of collections we need to fetch
            var dependencies = this.getDependencyListFor(modelName);
            // Build requests
            var requests = _.map(dependencies, function(dep){
                // Get collection
                var collection = this.get(dep);

                // Already fetched
                if (collection.size() > 0) {
                    return false;
                } else {
                    return collection.fetch({complete: function(){
                        self.trigger("store:dep:loaded", {
                            activity: " cargado(a)",
                            name: dep
                        });
                        console.log(dep + " cargado(a)");
                    }});
                }
            }, this);

            // Filter the already done
            requests = _.reject(requests, function(r) { return r == false });

            // Also, perform the actual fetch for the requested model
            var current_collection = this.get(modelName);
            requests.unshift(current_collection.fetch());

            var totalDependencies = requests.length;
            self.trigger("store:dep:totalDep", {data: totalDependencies});

            // Perform all in parallel and build links when done
            var that = this;
            $.when.apply($, requests).done(function() {
                // Build links
                console.log("All Requests done");

                // Build links for the model
                that.buildRelationshipsForModel(modelName);

                // And its dependencies
                _.each(dependencies, function(dep) {
                    that.buildRelationshipsForModel(dep);
                }, that);

                that.trigger("store:fetch:complete");

            });


        },

        buildRelationshipsForModel: function(modelName) {
            // Get definition
            var definition = this.definitions.get(modelName);

            // Build deps
            _.each(definition.get('deps'), function(dep) {
                // Where to look
                var target_collection = this.get(dep.model);

                // Now, for each item in the collection
                var collection = this.get(modelName);
                collection.each(function(model) {
                    // Get lookup key
                    var nested_type = dep.nested;
                    var lookup_value = model.get(dep.lookup);

                    if(nested_type !== undefined){
                        if(nested_type === "array"){
                            var target_array = [];
                            for(var i = 0; i < lookup_value.length; i++){
                                target_array.push(target_collection.get(lookup_value[i]));
                            }
                            model.set(dep.key, target_array);
                        }
                        else if(nested_type === "dictionary_array"){
                            var target_array = [];
                            for(var i = 0; i < lookup_value.length; i++){
                                var atributo = target_collection.get(lookup_value[i].atributo_id);
                                target_array.push({"atributo": atributo, "prioridad": lookup_value[i].prioridad});
                            }
                            model.set(dep.key, target_array);
                        }
                    }
                    else{
                        var target_model = target_collection.get(lookup_value);
                        // Store
                        model.set(dep.key, target_model);
                        // Find store name
                    }
                });
            }, this);
        },

        getDependencyListFor: function(modelName) {
            // TODO: Refactor this one, it's a mess @_@
            console.log("Fetching chain for ", modelName);
            var initial_model = this.definitions.get(modelName);

            // Dependency list
            var dependency_chain = [];

            // If any deps, proceed
            if (initial_model.get('deps').length > 0) {
                var visited_models = {};

                // Model names => ["Sede", "Sala", ...]
                var dependencies = _.pluck(initial_model.get('deps'), 'model');

                // Loop
                while (dependencies.length > 0) {
                    // Pick a dependency
                    var dependency = dependencies.shift();

                    // Only proceed if we haven't seen it already
                    if (visited_models[dependency]) {
                        continue;
                    }

                    // Add it to the dependency list
                    dependency_chain.push(dependency);

                    // Fetch the actual model using its name
                    var dependency_model = this.definitions.get(dependency);

                    // Add its deps to the list
                    dependencies.push.apply(
                        dependencies, _.pluck(dependency_model.get('deps'), 'model'));

                    // Mark it as visited
                    visited_models[dependency] = true;
                }
            }

            return dependency_chain;
        },

        //Section for the query language that the store will use

        getAttribute: function(queryString){
            var query = queryString.split(".");
            var mainCollection = query[0];

            var result = this.get(mainCollection);

            if(query.length > 1){
                result = mainCollection;
                for(var q = 1; q < query.length; q++){
                    result = result.get(query[q]);
                }
            }

            return result;
        },

        getModelUrl: function(modelName){
            return this.definitions.findWhere({"name": modelName}).get("urlRoot");
        },

        getImmediateDependenciesFor: function(modelName){
            var deps = this.definitions.findWhere({"name": modelName}).get("deps");
            return deps.filter(function(dep){
                return dep.nested === undefined;
            });
        }
    });

    return DarwinStore;
});
