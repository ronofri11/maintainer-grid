define([
	"backbone.marionette",
	"backbone.radio",
	"radio.shim",
    "text!/maintainer-grid/assets/typeahead_component/templates/typeahead.html",
    "text!/maintainer-grid/assets/typeahead_component/templates/optiontemplate.html"
], function (Marionette, Radio, Shim, TypeaHeadTemplate, OptionTemplate) {

    var TypeAheadConstructor = function(channelName){

        var TypeAhead = new Marionette.Application();
        TypeAhead.Channel = Radio.channel(channelName);

        TypeAhead.OptionItemView = Marionette.ItemView.extend({
            tagName: "li",
            template: _.template(OptionTemplate),
            templateHelpers: function(){
                cap = "";
                _.each(this.options.displayKeys, function(key){
                    cap = cap + "<span>" + this.model.get(key) + "</span>";
                }, this);

                return {caption: cap};
            },
            events: {
                "click": "enterOption"
            },
            initialize: function(){
                this.listenTo(this.model, "change:selected", this.updateSelected);
            },
            enterOption: function(event){
                TypeAhead.Channel.trigger("option:click", {
                    option:this.model
                });
                this.triggerMethod("optionClicked", {
                    model: this.model
                });
            },
            updateSelected: function(){
                if(this.model.get("selected")){
                    this.$el.addClass("selected");
                }
                else{
                    this.$el.removeClass("selected");
                }
            }
        });

        TypeAhead.OptionCompositeView = Marionette.CompositeView.extend({
            tagName: "div",
            className: "typeahead",
            childView: TypeAhead.OptionItemView,
            childViewContainer: "ul",
            template: _.template(TypeaHeadTemplate),
            events: {
                'focusin .searchbox input': 'toggleMglass',
                'focusout .searchbox input': 'outMglass',
                // 'click .optionbox ul li'   : 'enterOption'
                'keyup .searchbox input': 'filterOptions'
            },
            childEvents: {
                "optionClicked": "optionClicked"
            },
            initialize: function(options){
                this.childViewOptions = {
                    separator: options.separator,
                    displayKeys: options.displayKeys
                };
            },
            onShow: function(){
                this.setDimentionOptionBox();
            },
            setDimentionOptionBox: function(){
                var heightContainer = this.options.containerHeight;
                var searchboxHeight = this.$el.find(".searchbox").height();
                var optionboxHeight = heightContainer - searchboxHeight;
                this.$el.find(".optionbox").css({ "top": searchboxHeight + "px" });
                this.$el.find(".optionbox ul").height(optionboxHeight + "px");
            },
            modelCaption: function(model){
                var cap = "";
                _.each(this.options.displayKeys, function(key, i){
                    if(i === this.options.displayKeys.length - 1){
                        cap = cap + model.get(key);
                    }
                    else{
                        cap = cap + model.get(key) + ": ";
                    }
                }, this);
                return cap;
            },
            optionClicked: function(view, args){
                this.updateSelected(args.model);
            },
            updateSelected: function(model){
                this.collection.each(function(option){
                    if(option.cid === model.cid){
                        option.set({"selected": true});
                    }
                    else{
                        option.set({"selected": false});
                    }
                });

                var searchinput = this.$el.find(".searchbox input");
                var selectedItem = this.modelCaption(model);
                searchinput.val(selectedItem);
                this.outMglass();

                var index = this.collection.indexOf(model);
                this.adjustScroll(index);

                TypeAhead.Channel.trigger("selected:model:change", {model: model});
            },
            toggleMglass: function(){
                var searchinput = this.$el.find("input");
                var items = this.$el.find(".optionbox li");
                if( searchinput.val() != "" ){
                }else{
                    searchinput.removeClass("mglass");
                }
                items.removeClass("selected");
                searchinput.select();

            },
            outMglass: function(event){
                var searchinput = this.$el.find("input");
                var optionbox = this.$el.find(".optionbox");;
                if (searchinput.val() == '') {
                    searchinput.addClass("mglass");
                }else{
                    searchinput.removeClass("mglass");
                }
            },
            filterOptions: function(){
                var word = this.$el.find(".searchbox input").val();
                var word = word.toLowerCase();
                var optionArray = TypeAhead.optionCollection.filter(function(option){
                    var relevant = false;
                    _.each(this.options.displayKeys, function(key){
                        var condition = option.get(key).toLowerCase().indexOf(word) != -1;
                        relevant = relevant || condition;
                    }, this);
                    return relevant;
                }, this);

                TypeAhead.optionArrayPool.reset(optionArray);
            },
            selectNext: function(){
                var currentOption = this.collection.findWhere({
                    "selected": true
                });

                var index = this.collection.indexOf(currentOption);
                if(index < this.collection.length - 1){
                    var nextOption = this.collection.at(index + 1);
                    this.updateSelected(nextOption);
                }
            },
            selectPrev: function(){
                var currentOption = this.collection.findWhere({
                    "selected": true
                });

                var index = this.collection.indexOf(currentOption);
                if(index > 0){
                    var prevOption = this.collection.at(index - 1);
                    this.updateSelected(prevOption);
                }
            },
            adjustScroll: function(index){
                var optionbox = this.$el.find(".optionbox");
                var ulItem = optionbox.find("ul");
                var item = optionbox.find("li.selected");
                var top = item.offset().top;
                var stepDown = ulItem.scrollTop() + item.outerHeight() * 2;
                var stepUp = ulItem.scrollTop() - item.outerHeight() * 2;
                if( top > optionbox.offset().top + optionbox.outerHeight() - item.outerHeight() * 2 ){
                    ulItem.animate({scrollTop:stepDown}, '500', 'swing', function(){});
                }else if( top < optionbox.offset().top + item.outerHeight() * 2){
                    ulItem.animate({scrollTop:stepUp}, '500', 'swing', function(){});
                }
            }
        });

        TypeAhead.on("start", function(options){

            var OptionCollection = Backbone.Collection.extend();

            TypeAhead.optionCollection = options.models;
            TypeAhead.optionArrayPool = new OptionCollection();
            TypeAhead.optionArrayPool.reset(TypeAhead.optionCollection.toArray());

            TypeAhead.RootView = new TypeAhead.OptionCompositeView({
                collection: TypeAhead.optionArrayPool,
                containerHeight: options.containerHeight,
                separator: options.separator,
                displayKeys: options.displayKeys
            });

            TypeAhead.Channel.reply("get:typeahead:root", function(){
                return TypeAhead.RootView;
            });

            TypeAhead.Channel.on("option:click", function(args){
                var option = args.option;
            });

            TypeAhead.Channel.comply("option:next", function(){
                TypeAhead.RootView.selectNext();
            });

            TypeAhead.Channel.comply("option:prev", function(){
                TypeAhead.RootView.selectPrev();
            });
        });

        return TypeAhead;
    };

    return TypeAheadConstructor;
});
