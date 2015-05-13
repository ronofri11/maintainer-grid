define([
    "backbone",
    "models/table/forms/editor",
    "text!templates/editors/nestedtemplate.html",
    "text!templates/editors/disablednested.html"
], function (Backbone, Editor, NestedTemplate, DisabledNestedTemplate) {

    "use strict";

    var EditorView = Backbone.View.extend({

        tagName: "div",

        className: "editor",

        template: _.template(NestedTemplate),

        events:{
            "change select": "sendFilterData",
            "focusin select": "previousOptions",
            "focusout": "setInactive"
            // "keyup .searchbox input": "matchOptions"
        },

        initialize: function(options){
            //options has the configuration for one column of the row to be edited
            this.$container = options.selector;
            this.mode = options.mode;
            this.data = options.data;
            // console.log("MODE ------>", this.mode);
            this.enabled = this.model.get(this.mode);

            this.options = options.options;
            this.activeFilters = {};
            this.availableOptions = this.getFilteredOptions();

            this.placeholder = {
                filter: "", 
                display: "..."
            };

            this.currentSelection = "";

            // this.listenTo(this.model, "editor:refresh", this.render);
            // this.listenTo(this.model, "change:enabled", this.render);
            this.listenTo(this.model, "editor:reset:options", this.resetOptions);
            this.listenTo(this.model, "editor:filter:options", this.filterOptions);

            this.listenTo(this.model, "editor:removeView", this.removeView);
            this.listenTo(this.model, "editor:get:data", this.sendEditorData);

            this.listenTo(this.model, "editor:toggleActive", this.toggleActive);

            this.listenTo(this.model, "editor:enable", this.enableEditor);
            this.listenTo(this.model, "editor:disable", this.disableEditor);

            this.listenTo(this.model, "editor:nested:change:options", this.changeOptions);
            this.listenTo(this.model, "editor:nested:reset", this.resetSelection);

            this.listenTo(this.model, "editor:set:invalid", this.setInvalid);
            this.listenTo(this.model, "editor:set:valid", this.setValid);
        },

        resetSelection: function(){
            this.currentSelection = "";

            var filterData = {
                editor: this.model,
                data: this.currentSelection
            };

            this.model.trigger("editor:nested:change:filter", filterData);
        },

        changeOptions: function(optionData){
            this.options = optionData.options;
            this.refresh();         
        },

        getFilteredOptions: function(){
            var self = this;

            var displayKeys = this.model.get("displayKeys");

            var select_options = [];

            if(displayKeys.length > 0){

                select_options = _.uniq(self.options, function(option){
                    return option.getNested(displayKeys[0]);
                });
                select_options = _.sortBy(select_options, function(option){
                    return option.getNested(displayKeys[0]);
                });

                select_options = _.map(select_options, function(option){
                    var display = "";
                    var filter = option.getNested(displayKeys[0]);
                    for(var d = 0; d < displayKeys.length - 1; d++){
                        display = display + option.getNested(displayKeys[d]) + " - ";
                    }
                    display += option.getNested(displayKeys[displayKeys.length - 1]);
                    return {
                        display: display,
                        filter: filter
                    };
                });
            }

            return select_options;
        },

        sendFilterData: function(){
            var filterData = {
                editor: this.model,
                data: this.getCurrentData()
            };

            this.model.trigger("editor:nested:change:filter", filterData);
        },

        filterOptions: function(filterObj){
            var filter = filterObj.filter;
            // console.log("filterOptions:", filter);
            this.activeFilters[filter.getKey] = filter.value;
            // console.log("this.activeFilters:", this.activeFilters);

            this.refresh();

            this.updateAffectedFields();

        },

        resetActiveFilters: function(){
            this.activeFilters = {};
        },

        refresh: function(){
            this.availableOptions = this.getFilteredOptions();
            this.render();
        },

        render: function(){
            this.$el.detach();

            if(!this.enabled){
                this.template = _.template(DisabledNestedTemplate);
                var self = this;
                this.$el.on("dblclick", function(){
                    self.enableEditor.call(self);
                });
            }
            else{
                this.template = _.template(NestedTemplate);
                this.$el.off("dblclick");
            }

            this.$el.html(this.template(this.toDict()));
            this.styling();
            this.$container.append(this.$el);
            // this.$el.find("select").select();

            // this.$el.trigger("view:rendered");
        },

        styling: function(){
            var cellWidth = this.$container.width();
            var cellHeight = this.$container.height();
            // set dimension
            this.$el.width(cellWidth + 4 + 'px');
            this.$el.height(cellHeight + 2 + 'px');

            this.$el.css({
                "padding":"0",
                "-moz-box-shadow":"none",
                "-webkit-box-shadow":"none",
                "box-shadow":"none"
            });

            if(!this.enabled){
                this.$el.addClass("disableEditors");
            }
            else{
                this.$el.removeClass("disableEditors");
            }

        },

        updateAffectedFields: function(){
            var currentSelection = this.getCurrentData();
            if(currentSelection === this.placeholder.filter){
                this.model.trigger("editor:nested:reset",{
                    affectedKeys: this.model.get("affectedKeys"),
                    fieldValue: currentSelection
                });
            }
            else{
                this.model.trigger("editor:nested:filter", {
                    affectedKeys: this.model.get("affectedKeys"),
                    fieldValue: currentSelection
                }); 
            }
        },

        resetOptions: function(filters){
            this.resetActiveFilters();
            this.refresh();
        },

        getCurrentData: function(){
            this.currentSelection = this.$el.find("select option:selected").attr("data-filter");
            return this.currentSelection;
        },

        sendEditorData: function(){
            this.model.trigger("editor:receive:data", {
                data: this.getCurrentData()
            });
        },

        getNestedJSON: function(nestedKey){
            var result = this.data;
            var keys = nestedKey.split("__");
            for(var i = 0; i < keys.length; i++){
                result = result[keys[i]];
                if(result === undefined){
                    return null;
                }
            }
            return result;
        },

        toDict: function(){
            var self = this;
            var displayKeys = this.model.get("displayKeys");
            var disabledText = "...";
            // if(!this.model.get(this.mode)){
            //     disabledText = this.data[this.model.get("disabledDisplay")[0]];
            // }
            if(displayKeys.length > 0){
                disabledText = this.getNestedJSON(displayKeys[0]);
            }

            return {
                current: this.currentSelection,
                data: this.data,
                key: this.model.get("key"),
                displayKeys: displayKeys,
                placeholder: this.placeholder,
                disabledText: disabledText,
                options: this.availableOptions,
                searchValue: this.searchValue
            }
        },

        removeView: function(){
            this.unbind();
            this.remove();
        },

        // matchOptions: function(){
        //     var keyword = this.$el.find(".searchbox input").val().toLowerCase();
        //     this.searchValue = keyword;
        //     this.searchValueChanged();
        // },

        // searchValueChanged: function(){

        //     var self = this;
            
        //     this.viewOptions = _.filter(this.availableOptions, function(option){
        //         if(option.display.toLowerCase().indexOf(self.searchValue) !== -1){
        //             return true;
        //         }

        //         return false;
        //     });

        //     this.render();
        // },

        keyboardInterface: function(event){
            event.stopImmediatePropagation();
            if(event.which === 13){//key ENTER
                this.hide();
            }
        },

        optionLookup: function(id){
            var options = this.model.get("options");
            for(var i = 0; i < options.length; i++){
                // console.log(options[i]);
                if(options[i].id === parseInt(id)){
                    return options[i];
                }
            }

            return undefined;
        },

        disableEditor: function(){
            this.enabled = false;
            this.render();
        },

        enableEditor: function(){
            if(this.model.get(this.mode)){
                this.enabled = true;
                this.model.trigger("editor:add:enabled", {
                    key: this.model.get("key")
                });
                this.render();
            }
        },

        isEnabled: function(){
            return this.enabled;
        },

        setActive: function(){
            this.$container.addClass("activeEditor");
        },

        setInactive: function(){
            this.$container.removeClass("activeEditor");
        },

        toggleActive: function(){
            this.$container.toggleClass("activeEditor")
        },

        setInvalid: function(){
            this.$container.addClass("errorFields");
        },

        setValid: function(){
            this.$container.removeClass("errorFields");
        }
    });

    return EditorView;
});
