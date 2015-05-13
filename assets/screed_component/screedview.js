define([
    "backbone",
    "models/table/forms/editor",
    "collections/table/editors/editors",
    "views/table/screed/editors/editorlist",
    "views/table/screed/editors/editorgrid",
    "views/table/screed/editors/editorselect",
    "views/table/screed/editors/editornormal",
    "views/table/screed/editors/editornested"
], function (Backbone, EditorModel, EditorCollection, ListEditor, GridEditor, SelectEditor, NormalEditor, NestedEditor) {
    "use strict";

    var ScreedView = Backbone.View.extend({

        tagName: "tr",

        className: "screed",

        events:{
            "click .options .cancel": "discardChanges",
            "click .options .save": "saveChanges"
        },

        initialize: function(options){
            this.active = false;
            this.optionMap = {};

            this.legendWidths = options.legendWidths;
            this.editors = new EditorCollection({
                propertySeparator: options.propertySeparator
            });
            this.editors.reset(options.editors);

            this.listenTo(this.editors, "editor:set:active", this.setActiveEditor);
            // this.listenTo(this.editors, "editor:enable", this.enableEditor);
        },

        show: function(params){
            //params should have an array of rows,
            //an array of column config items for the editors
            //and a selector in which the form will be appended.

            if(this.active === false){
                this.active = true;

                this.mode = params.mode;
                this.$container = params.selector;
                this.rows = params.rows;

                this.columns = params.columns;

                this.editors.resetAcceptedKeys();

                this.legendWidths = params.legendWidths;

                this.render();

                this.$container.append(this.$el);

                this.dimensionOpen();
            }
        },

        activeEditor: function(event){
            // var td = $(event.target).closest("td");
            // var colKey = td.attr("data-key");
            // if(this.editors[colKey].model.get("type") !== "key"){
            //     this.setActiveEditor(td);
            // }
        },

        setActiveEditor: function(selector){
            // this.$el.find("td").removeClass("activeEditor");
            // selector.addClass("activeEditor");
        },

        dimensionOpen: function(){
            var topTbody = this.$el.height()+$(".table .filters").height()+$(".table .legends").height();
            $(".table tbody").animate({top:topTbody}, 200);
            this.$el.css("display","none").delay(100).fadeToggle(800);

        },

        dimensionClose: function(){
            var topTbody = $(".table .filters").height()+$(".table .legends").height();
            this.$el.fadeToggle(400);
            $(".table tbody").delay(400).animate({top:topTbody}, 150);
        },

        renderEditor: function(editor){
            var key = editor.get("key");

            var data = this.getWorkingData(editor);

            var screedWidth = this.legendWidths[key];

            this.$el.append("<td data-key=\"" + key + "\" style=\"width:" + screedWidth + "px;\"></td>");

            var selector = this.$el.find("td[data-key=\"" + key + "\"]");

            var editorParams = {
                mode: this.mode,
                model: editor,
                data: data,
                selector: selector
            };

            // console.log(editor.toJSON());

            var modelSource = editor.get("source");

            if(modelSource !== null){
                if(this.optionMap[modelSource] === undefined){
                    this.trigger("editor:query", {key: key, source: editor.get("source")});
                }
                editorParams["options"] = this.optionMap[editor.get("source")];
            }

            var editorview;

            switch(editor.get("type")){
                case "list":
                    editorview = new ListEditor(editorParams);
                    break;
                case "select":
                    editorview = new NestedEditor(editorParams);
                    break;
                case "grid":
                    editorview = new GridEditor(editorParams);
                    break;
                default:
                    editorview = new NormalEditor(editorParams);
            }

            if(this.columns !== null){
                // console.log("COLUMNS!!!!!!!!!!!!", this.columns);
                if(this.columns.indexOf(editor.get("key")) !== -1){
                    editor.trigger("editor:enable");
                }
                else{
                    editor.trigger("editor:disable");
                }

                this.editors.setAcceptedKeys(this.columns);
            }

            editorview.render();

            //each editorview when rendered should start enabled or disabled
            //depending on the editor attributes "creation" and "edition"
        },

        render: function(){
            var self = this;

            var oneActive = false;

            this.editors.each(function(editor){
                self.renderEditor(editor);
            });

            this.editors.buildNestedTreeFilters(this.mode);
            this.editors.setNestedOptions(this.optionMap);
            // console.log(this.optionMap);

            // options panel
            this.$el.append("<div class=\"options\"><button class=\"cancel\"></button><button class=\"save\"></button></div>");

        },

        getWorkingData: function(editor){

            var data;
            var comp;

            var comparatorKey = editor.get("key");
            var relevantKey = editor.get("setKey");

            for(var r = 0; r < this.rows.length; r++){
                var row = this.rows[r];
                var rowData = row.getNested(relevantKey);
                var rowComp = row.getNested(comparatorKey);

                var json;
                var jsonComp;

                if(rowData === null){
                    rowData = editor.get("defaultValue");
                }

                json = JSON.stringify(rowData);
                jsonComp = JSON.stringify(rowComp);

                if(data === undefined){
                    data = json;
                }

                if(comp === undefined){
                    comp = jsonComp;
                }

                if(comp !== jsonComp){
                    if(editor.get("defaultValue") !== undefined && editor.get(this.mode)){
                        data = editor.get("defaultValue");
                    }

                    else{
                        data = "...";
                    }

                    data = JSON.stringify(data);
                    break;
                }
            }

            return JSON.parse(data);
        },

        discardChanges: function(event){
            this.hide();
        },

        saveChanges: function(){
            // console.log("saveChanges acceptedKeys",this.editors.acceptedKeys);
            var self = this;
            var isValid = this.editors.validateData(this.mode);

            var message;

            if(isValid){
                var result = this.editors.collectData(this.mode);
                // console.log("screedview result", result);

                var setDict = {};

                _.each(result.nestedProperties, function(nestedProperty, setKey){
                    // console.log(nestedProperty);
                    var models = self.optionMap[nestedProperty.source];
                    // console.log("screed savechanges", models);
                    var selectedModels = _.filter(models, function(model){
                        for(var filterKey in nestedProperty.filters){
                            // console.log("screed filtering", model,  model.getNested(filterKey), nestedProperty.filters[filterKey]);
                            if(model.getNested(filterKey) != nestedProperty.filters[filterKey]){
                                return false;
                            }
                        }
                        return true;
                    });

                    // console.log("save changes screed selectedMODELS:", selectedModels);

                    setDict[setKey] = selectedModels[0];
                });

                _.each(result.properties, function(property, setKey){
                    // console.log(property);
                    setDict[setKey] = property;
                });

                _.each(this.rows, function(row){
                    row.setNested(setDict);
                    // console.log(self.mode);
                    if(self.mode === "creation"){
                        row.set("changed",[]);
                        row.set("newRow", true);
                        self.trigger("screed:row:created", {row:row});
                        message = "Registro creado con éxito.";
                    }
                    else{
                        row.trigger("row:modified");
                    }
                });

                this.hide(message);
            }
            else{
                message = "Datos insuficientes para crear registro";
                notificacion(3, message, true);
            }
            // this.trigger("screed:send:data", {data: result});
        },

        hide: function(message){
            // console.log("hide acceptedKeys",this.editors.acceptedKeys);

            var self = this;

            // if(this.mode === "creation"){
            //     _.each(this.rows, function(row){
            //         row.destroy();
            //     });
            // }

            this.editors.each(function(editor){
                editor.trigger("editor:removeView");
            });

            this.dimensionClose();

            this.active = false;

            //should be refactored ?
            this.$el.empty();

            if(message !== undefined){
                notificacion(1, message, true);
            }
        },

        isActive: function(){
            return this.active;
        },

        setOptions: function(key, options){
            // console.log(options);
            this.optionMap[key] = options;
        },

        activateNext: function(){
            this.editors.activateNextEditor();
        }

    });

    return ScreedView;
});
