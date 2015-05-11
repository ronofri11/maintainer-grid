define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../js/darwinclasses"
], function (Marionette, Radio, Shim, DarwinClasses) {

    var StoreConstructor = function(channelName, configUrl){
        //this App works as the full darwin store component
        var Store = new Marionette.Application();
        Store.Channel = Radio.channel(channelName);
        Store.configUrl = configUrl;

        Store.on("before:start", function(args){
            Store.base_url = args.url;
            Store.setInitHandlers();
        });

        Store.on("start", function(args){
            Store.Channel.trigger("start:configuration");
            Store.setInteractionHandlers();
        });

        Store.setInitHandlers = function(){
            Store.Channel.on("start:configuration", function(){
                Store.Channel.trigger("fetch:definitions");
            });

            Store.Channel.on("fetch:definitions", function(){
                var definitions;
                $.ajax({
                    type: "GET",
                    url: Store.configUrl,
                    dataType: "json"
                }).done(function(data){
                    definitions = data;
                    Store.Channel.trigger("generate:store:structure", {
                        definitions: definitions
                    });
                });
            });

            Store.Channel.on("generate:store:structure", function(args){
                Store.Definitions = new DarwinClasses.Definitions(args.definitions);
                Store.Models = {};
                Store.Collections = {};
                // Store.Extractors = {};

                var base_url = Store.base_url;

                Store.Definitions.each(function(def){
                    var modelName = def.get("name");
                    var collectionName = def.get("collectionName");

                    // Create a new Model class
                    var model = DarwinClasses.DarwinModel.extend({
                        // URL root for this model
                        urlRoot: base_url + def.get("urlRoot")
                    });

                    // Backbone Collection
                    var collection = DarwinClasses.DarwinCollection.extend({
                        url: base_url + def.get("urlRoot"),
                    });

                    //Extractor part is missing from the store version used in table-component

                    //Save classes
                    Store.Models[modelName] = model;
                    Store.Collections[collectionName] = collection;
                    // Store.Extractors[modelName] = extractor;
                });

                Store.Channel.trigger("build:collection:instances");
            });

            Store.Channel.on("build:collection:instances", function(){
                Store.models = {};
                Store.Definitions.each(function(def){
                    var modelName = def.get("name");
                    var collectionName = def.get("collectionName");
                    var collection = Store.Collections[collectionName];
                    Store.models[modelName] = new collection();
                });

                Store.Channel.trigger("end:configuration");
                console.log("Store models:", Store.models);
            });
        };

        Store.setInteractionHandlers = function(){
            Store.Channel.reply("get:dependencies:for", function(args){
                var modelName = args.modelName;

                console.log("Fetching chain for ", modelName);
                var initial_model = Store.Definitions.get(modelName);

                // Dependency list
                var dependency_chain = [];

                // If any deps, proceed
                if (initial_model.get("deps").length > 0) {
                    var visited_models = {};

                    // Model names => ["Sede", "Sala", ...]
                    var dependencies = _.pluck(initial_model.get("deps"), "model");

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
                        var dependency_model = Store.Definitions.get(dependency);

                        // Add its deps to the list
                        dependencies.push.apply(
                            dependencies, _.pluck(dependency_model.get("deps"), "model"));

                        // Mark it as visited
                        visited_models[dependency] = true;
                    }
                }
                return dependency_chain;
            });
            Store.Channel.comply("fetch:chain:for", function(args){
                var modelName = args.modelName;

                // First, get the chain of collections we need to fetch
                var dependencies = Store.Channel.request("get:dependencies:for", args);
                // Build requests
                var requests = _.map(dependencies, function(dep){
                    // Get collection
                    var collection = Store.models[dep];

                    // Already fetched
                    if (collection.size() > 0) {
                        return false;
                    } else {
                        return collection.fetch({complete: function(){
                            console.log(dep + " cargado(a)");
                        }});
                    }
                });

                // Filter the already done
                requests = _.reject(requests, function(r) { return r == false });

                // Also, perform the actual fetch for the requested model
                var current_collection = Store.models[modelName];
                requests.unshift(current_collection.fetch());

                // Perform all in parallel and build links when done
                $.when.apply($, requests).done(function() {
                    // Build links
                    console.log("All Requests done");

                    // Build links for the model
                    Store.Channel.command("build:relationships:for", {modelName: modelName});

                    // And its dependencies
                    _.each(dependencies, function(dep) {
                        Store.Channel.command("build:relationships:for", {modelName: dep});
                    });

                    console.log("Store models full", Store.models);
                    Store.Channel.trigger("store:model:loaded", {modelName: modelName});
                });
            });

            Store.Channel.comply("build:relationships:for", function(args){
                var modelName = args.modelName;

                // Get definition
                var definition = Store.Definitions.get(modelName);

                // Build deps
                _.each(definition.get('deps'), function(dep) {
                    // Where to look
                    var target_collection = Store.models[dep.model];

                    // Now, for each item in the collection
                    var collection = Store.models[modelName];
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
                });
            });
            
            Store.Channel.reply("get:models", function(args){
                var modelName = args.modelName;
                return Store.models[modelName];
            });

            Store.Channel.reply("get:collection:class", function(args){
                var modelName = args.modelName;

                var definition = Store.Definitions.findWhere({"name": modelName});
                if(definition !== undefined){
                    return Store.Collections[definition.get("collectionName")];
                }
                return undefined;
            });

        };


        return Store;
    };

    return StoreConstructor;
});
