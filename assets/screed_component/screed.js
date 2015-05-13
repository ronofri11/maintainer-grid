define([
    "backbone.marionette",
    "backbone.radio",
    "radio.shim",
    "../js/screedclasses"
], function (Marionette, Radio, Shim, ScreedClasses) {

    var ScreedConstructor = function(channelName){
        //this App works as the full maintainer component
        var Screed = new Marionette.Application();
        Screed.Channel = Radio.channel(channelName);

        var EditorNormal = Marionette.ItemView.extend({
            tagName: "div",
            className: "editor",
            events:{
                "click input": "selectText",
                "focusin": "setActive",
                "focusout": "setInactive"
            },

            initialize: function(options){
                //options has the configuration for one column of the row to be edited
                this.$container = options.selector;
                this.mode = options.mode;
                this.data = options.data;
                if(this.data === undefined){
                    this.data = this.model.get("defaultValue");
                }
                // console.log("MODE ------>", this.mode);
                this.enabled = this.model.get(this.mode);

                // console.log("this.editornormalmodel:", this.model);

                this.setTemplate();
                // this.listenTo(this.model, "editor:refresh", this.render);
                // this.listenTo(this.model, "change:enabled", this.render);
                this.listenTo(this.model, "editor:reset:options", this.resetOptions);
                this.listenTo(this.model, "editor:filter:options", this.filterOptions);
                this.listenTo(this.model, "editor:removeView", this.removeView);
                this.listenTo(this.model, "editor:get:data", this.sendEditorData);
                this.listenTo(this.model, "change:enabled", this.render);

                this.listenTo(this.model, "editor:toggleActive", this.toggleActive);

                this.listenTo(this.model, "editor:enable", this.enableEditor);
                this.listenTo(this.model, "editor:disable", this.disableEditor);

                this.listenTo(this.model, "editor:set:invalid", this.setInvalid);
                this.listenTo(this.model, "editor:set:valid", this.setValid);
            },

            setTemplate: function(){
                // console.log(this.model.get("type"));
                switch(this.model.get("type")){
                    case "number":
                        this.template = _.template(NumberTemplate);
                        break;
                    case "string":
                        this.template = _.template(StringTemplate);
                        break;
                    case "boolean":
                        this.template = _.template(BooleanTemplate);
                        break;
                }
            },

            render: function(){
                this.$el.detach();
                this.$el.html(this.template(this.toDict()));
                this.styling();
                this.$container.append(this.$el);
                // this.$el.find("input").select();
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
                    this.$el.find("input").attr("disabled", true);
                    var self = this;
                    this.$el.on("dblclick", function(){
                        self.enableEditor.call(self);
                    });
                }
                else{
                    this.$el.removeClass("disableEditors");
                    this.$el.find("input").attr("disabled", false);
                    this.$el.off("dblclick");
                }

            },

            getCurrentData: function(){

                var newValue;

                switch(this.model.get("type")){
                    case "number":
                        newValue = parseInt(this.$el.find("input").val());
                        break;
                    case "string":
                        newValue = this.$el.find("input").val();
                        break;
                    case "boolean":
                        newValue = this.$el.find("input").prop("checked");
                        break;
                }
                // console.log(newValue);

                return newValue;
            },

            sendEditorData: function(){
                this.model.trigger("editor:receive:data", {
                    data: this.getCurrentData()
                });
            },


            toDict: function(){
                return {
                    type: this.model.get("type"),
                    data: this.data,
                    key: this.model.get("key")
                }
            },

            removeView: function(){
                this.unbind();
                this.remove();
            },

            selectText: function(){
                this.$el.find("input").select();
            },

            keyboardInterface: function(event){
                event.stopImmediatePropagation();
                if(event.which === 13){//key ENTER
                    this.hide();
                }
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

        return Screed;
    };

    return ScreedConstructor;
});
