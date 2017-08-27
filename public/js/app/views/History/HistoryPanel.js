define(function(require, exports, module) {
	
	var BouncingPanel = require("app/widgets/BouncingPanel");

	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
	var Transform = require("famous/core/Transform");
	var RenderNode = require("famous/core/RenderNode");
    var ScrollView = require("famous/views/ScrollContainer");

    var LevelRow = require("app/views/History/LevelRow");

    var GameSounds = require("app/audio/GameSounds");
    
	var HistoryPanel = function() {
		View.apply(this, arguments);

        _create.call(this);
		_init.call(this);   
	};
	HistoryPanel.prototype = Object.create(View.prototype);
	HistoryPanel.prototype.constructor = HistoryPanel;

    HistoryPanel.DEFAULT = {
        visible : false
    }

    var _createHeaderSection = function() {

        this.closeModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.08, 0]
        });
        this.closeButton = new Surface({
            content : "Close",
            size : [true, true],
            properties : {
                fontSize: '0.7em'
            }
        });

        var historyPanel = this;
        this.closeButton.on('click', function(evt) {
            GameSounds().playSound(4);
            historyPanel.hide();
        });

        //title
        this.titleModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.5, 0]
        });
        this.titleText = new Surface({
            content : "Past Scores",
            size: [true, true],
            properties : {
                fontSize : '0.8em'
            }
        });     

    };

    var _create = function() {
        //background panel
        this.backgroundPanel = new BouncingPanel({
            size : this.options.size || [],
            classes : this.options.classes
        });

        
        var views = [];

        var scrollView = new ScrollView({
            classes : ['history-scroll']
        });
        scrollView.sequenceFrom(views);

        //get data from localstorage

        //get game data from local storage
        var gameData = JSON.parse(localStorage.getItem("gameData"));
        if(!gameData) {
            gameData = {
                levelData : {}
            };
        }
        var keys = Object.keys(gameData.levelData);

        //create surfaces
        keys.forEach(function(key) {
            var scoresForLevel = gameData.levelData[key];
            var renderNode = new RenderNode();

            var viewModifier = new Modifier({
                origin : [0, 0]
            });
            var view = new LevelRow({
                level : key,
                scores : scoresForLevel
            });

            renderNode.add(viewModifier).add(view);

            view.pipe(scrollView);
            views.push(renderNode);
        });

        this.scrollModifier = new Modifier({
            origin : [0.5, 0.5],
            align : [0.5, 0.55],
            size : [this.options.size[0]*0.9, this.options.size[1]*0.8]
        });
        this.scrollview = scrollView;
        _createHeaderSection.call(this); 
    };

	var _init = function() {	
        this.backgroundPanel.show();
        this.backgroundPanel.getContainer().add(this.scrollModifier).add(this.scrollview);
        this.backgroundPanel.getContainer().add(this.titleModifier).add(this.titleText);   
        this.backgroundPanel.getContainer().add(this.closeModifier).add(this.closeButton); 
    	this.add(this.backgroundPanel);
	};

    HistoryPanel.prototype.show = function(){
        this.visible = true;
    };

    HistoryPanel.prototype.hide = function(){
        var historyPanel = this;
        var period = this.backgroundPanel.getTransitionPeriod();
        this.backgroundPanel.hide();
        setTimeout(function() {
            historyPanel.visible = false;
        }, period*2);
        
    };

    HistoryPanel.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    };

	module.exports = HistoryPanel;

});