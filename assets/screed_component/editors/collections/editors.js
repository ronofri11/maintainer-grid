/*global define */
define([
    "backbone",
    "models/table/forms/editor"
], function (Backbone, Editor) {
    "use strict";

    var Editors = Backbone.Collection.extend({
        model: Editor,

        initialize: function(options){
            this.propertySeparator = options.propertySeparator;
            this.data = {};
            this.changedData = true;
            this.acceptedKeys = [];
            this.nestedTree = {};
            
            this.listenTo(this, "editor:receive:data", this.receiveData);
            this.listenTo(this, "editor:changedData", this.setChangedData);

            this.listenTo(this, "editor:add:enabled", this.updateAcceptedKeys);

            this.listenTo(this, "editor:nested:change:filter", this.updateFilter);
        },

        resetNestedTree: function(){
            this.nestedTree = {};
        },

        buildNestedTreeFilters: function(mode){
            var self = this;

            this.resetNestedTree();

            this.each(function(editor){
                var conditionOfAcceptance = editor.get(mode);
                if(self.acceptedKeys.length > 0){
                    conditionOfAcceptance = conditionOfAcceptance
                    && self.acceptedKeys.indexOf(editor.get("key")) !== -1;
                }
                if(conditionOfAcceptance){
                    editor.trigger("editor:get:data");
                    // console.log("building trees", self.data);
                    
                    if(editor.get("fieldType") === "nestedProperty"){
                        if(self.nestedTree[editor.get("setKey")] === undefined){
                            self.nestedTree[editor.get("setKey")] = {
                                filters: {},
                                source: editor.get("source"),
                                total: 1
                            };
                        }
                        else{
                            self.nestedTree[editor.get("setKey")]["total"] += 1;
                        }
                    }
                }
            });

            // console.log(this.nestedTree);
        },

        setNestedOptions: function(optionMap){
            var self = this;

            if(this.optionMap === undefined){
                this.optionMap = _.clone(optionMap);
            }
            _.each(this.nestedTree, function(nestedProperty){
                if(nestedProperty["options"] === undefined){
                    nestedProperty["options"] = _.clone(self.optionMap[nestedProperty["source"]]);
                }
            });
        },

        updateFilter: function(filterData){
            var editor = filterData.editor;
            var setKey = editor.get("setKey");
            var getKey = editor.get("key");
            var source = editor.get("source");
            var index = editor.get("index");

            if(this.nestedTree[setKey]["total"] > 1){
                if(getKey !== setKey){
                    var pathEditorContext = setKey + "__";
                    var editorContext = getKey.indexOf(pathEditorContext) + pathEditorContext.length;
                    getKey = getKey.substr(editorContext);
                }

                if(filterData.data === ""){
                    if(this.nestedTree[setKey]["filters"][getKey] !== undefined){
                        delete this.nestedTree[setKey]["filters"][getKey];
                        var self = this;
                        _.each(editor.get("affectedKeys"), function(affectedKey){
                            // console.log(index, "affKey: ", affectedKey);
                            var affectedEditor = self.findWhere({"index": affectedKey.index});
                            affectedEditor.trigger("editor:nested:reset");
                        });
                    }
                }
                else{
                    this.nestedTree[setKey]["filters"][getKey] = filterData.data;
                }

                this.updateNestedEditorOptions(setKey);
            }

        },

        filterOptions: function(editor){
            var self = this;
            var source = editor.get("source");
            var setKey = editor.get("setKey");
            var getKey = editor.get("key");

            var pathEditorContext = setKey + "__";
            var editorContext = getKey.indexOf(pathEditorContext) + pathEditorContext.length;
            getKey = getKey.substr(editorContext);

            var filteredOptions = _.filter(this.optionMap[source], function(option){
                var relevant = true;
                _.each(self.nestedTree[setKey]["filters"], function(filter, key){
                    if(getKey !== key){
                        if(option.getNested(key) != filter){
                            relevant = false;
                        }
                    }
                });
                return relevant;
            });

            // console.log("filteredOptions length", filteredOptions.length, getKey);

            return filteredOptions;
        },

        updateNestedEditorOptions: function(setKey){
            var self = this;

            this.each(function(editor){
                if(editor.get("setKey") === setKey){
                    var filteredOptions = self.filterOptions(editor);
                    editor.trigger("editor:nested:change:options", {
                        options: filteredOptions
                    });
                }
            });
        },

        resetAcceptedKeys: function(){
            this.acceptedKeys = [];
        },

        setAcceptedKeys: function(acceptedKeys){
            this.resetAcceptedKeys();
            this.acceptedKeys = _.clone(acceptedKeys);
        },

        updateAcceptedKeys: function(editorData){
            var editorKey = editorData.key;

            if(this.acceptedKeys.indexOf(editorKey) === -1){
                this.acceptedKeys.push(editorKey);
            }
        },

        collectData: function(mode){
            var self = this;
            var result = {
                nestedProperties:{},
                properties:{}
            };
            this.each(function(editor){
                var conditionOfAcceptance = editor.get(mode);
                if(self.acceptedKeys.length > 0){
                    conditionOfAcceptance = conditionOfAcceptance
                    && self.acceptedKeys.indexOf(editor.get("key")) !== -1;
                }
                if(conditionOfAcceptance){
                    editor.trigger("editor:get:data");
                    // console.log("data received successfully", self.data);
                    
                    var fieldType = editor.get("fieldType");
                    // console.log(fieldType);

                    switch(fieldType){
                        case "property":
                            self.propertyProcess(editor, result, self.data);
                            break;
                        case "nestedProperty":
                            self.nestedPropertyProcess(editor, result, self.data);
                            break;
                    }
                }
            });

            return result;
        },

        nestedPropertyProcess: function(editor, resultDict, data){
            var setKey = editor.get("setKey");

            if(resultDict["nestedProperties"][setKey] === undefined){
                    resultDict["nestedProperties"][setKey] = {
                        source: editor.get("source"),
                        filters: {}
                    };
                }

            var filterKey;
            var key = editor.get("key");

            if(key !== setKey){
                var pathEditorContext = setKey + "__";
                var editorContext = key.indexOf(pathEditorContext) + pathEditorContext.length;
                filterKey = key.substr(editorContext);
            }
            else{
                filterKey = setKey;
            }
            // console.log("parsing", key, setKey, editorContext, key.substr(editorContext));
            resultDict["nestedProperties"][setKey]["filters"][filterKey] = data;
        },

        propertyProcess: function(editor, resultDict, data){
            var setKey = editor.get("setKey");

            var editorType = editor.get("type");

            if(editorType === "list" || editorType === "grid"){
                editor.trigger("editor:getChangedData");
                if(this.changedData === true){
                    if(resultDict["properties"][setKey] === undefined){
                        resultDict["properties"][setKey] = {
                            source: editor.get("source"),
                            filters: {}
                        };
                    }
                        
                    resultDict["properties"][setKey] = data;
                }
            }

            else{
                    if(resultDict["properties"][setKey] === undefined){
                        resultDict["properties"][setKey] = {
                            source: editor.get("source"),
                            filters: {}
                        };
                    }
                        
                    resultDict["properties"][setKey] = data;
            }
        },

        receiveData: function(editorData){
            // console.log("Collection Editor receive data:", editorData);
            this.data = editorData.data;
        },

        setChangedData: function(data){
            this.changedData = data.data;
        },

        setActiveEditor: function(editor){
            this.activeEditor = editor;
        },

        activateNextEditor: function(){
            var current = this.indexOf(this.activeEditor);
            this.activeEditor.trigger("editor:toggleActive");

            this.activeEditor = this.at((current + 1)%this.length);
            this.activeEditor.trigger("editor:toggleActive");
        },

        validateData: function(mode){
            var self = this;
            var validatePass = true;

            this.each(function(editor){
                var conditionOfAcceptance = editor.get(mode);
                if(self.acceptedKeys.length > 0){
                    conditionOfAcceptance = conditionOfAcceptance
                    && self.acceptedKeys.indexOf(editor.get("key")) !== -1;
                }
                // console.log("editor:", editor.get("index"), "condition:",conditionOfAcceptance, "required:", editor.get("required"));
                if(conditionOfAcceptance && editor.get("required")){
                    editor.trigger("editor:get:data");
                    // console.log("data received successfully", self.data);
                    
                    var dataType = editor.get("type");
                    if(dataType === "number"){
                        if(self.data == NaN){
                            validatePass = false;
                            editor.trigger("editor:set:invalid");
                        }
                        else{
                            editor.trigger("editor:set:valid");
                        }
                    }
                    else{
                        if(self.data === "" || self.data === undefined || self.data === null){
                            validatePass = false;
                            editor.trigger("editor:set:invalid");
                        }
                        else{
                            editor.trigger("editor:set:valid");
                        }
                    }
                }
            });

            return validatePass;
        }
    });

    return Editors;
});
