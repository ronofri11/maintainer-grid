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
                    // that.buildRelationshipsForModel(modelName);

                    // And its dependencies
                    // _.each(dependencies, function(dep) {
                    //     that.buildRelationshipsForModel(dep);
                    // }, that);

                    // that.trigger("store:fetch:complete");
                    console.log("Store models full", Store.models);
                });
            });
        };


        return Store;
    };

    return StoreConstructor;
});
