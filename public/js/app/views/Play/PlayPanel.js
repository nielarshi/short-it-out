define(function(require, exports, module) {
	
	var BouncingPanel = require("app/widgets/BouncingPanel");
    var LevelsPanel = require("app/views/Play/LevelsPanel");


	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
	var Transform = require("famous/core/Transform");
	var RenderNode = require("famous/core/RenderNode");
	var GridLayout = require("famous/views/GridLayout");

    var GameSounds = require("app/audio/GameSounds");
    
	var PlayPanel = function() {
		View.apply(this, arguments);

        _create.call(this);
		_init.call(this);   

	}
	PlayPanel.prototype = Object.create(View.prototype);
	PlayPanel.prototype.constructor = PlayPanel;

    PlayPanel.DEFAULT = {
        visible : false
    }

    var _createHeaderSection = function() {

        this.closeModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.08, 0.01]
        });
        this.closeButton = new Surface({
            content : "Close",
            size : [true, true],
            properties : {
                fontSize: '0.7em',
                color: 'white'
            }
        });

        var playPanel = this;
        this.closeButton.on('click', function(evt) {
            //attach audio on closing 
            GameSounds().playSound(4);
            playPanel.hide();
        });

        //title
        this.titleModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.5, 0]
        });
        this.titleText = new Surface({
            content : "Levels",
            size: [true, true]
        });     

    };

    var _createLevelsPanel = function() {
        var playPanel = this;
        this.levelsPanel = new LevelsPanel({
            size : this.options.size
        });
    };

    var _create = function() {
        //background panel
        this.backgroundPanel = new BouncingPanel({
            size : this.options.size || [],
            classes : this.options.classes
        });

        _createHeaderSection.call(this);

        _createLevelsPanel.call(this);
           
    };

	var _init = function() {
		
        this.backgroundPanel.show();
        this.backgroundPanel.getContainer().add(this.titleModifier).add(this.titleText);   
        this.backgroundPanel.getContainer().add(this.closeModifier).add(this.closeButton); 
    	this.add(this.backgroundPanel);

        this.backgroundPanel.getContainer().add(this.levelsPanel);
	};

    PlayPanel.prototype.show = function(){
        this.visible = true;
    };

    PlayPanel.prototype.hide = function(){
        var playPanel = this;
        var period = this.backgroundPanel.getTransitionPeriod();
        this.backgroundPanel.hide();
        setTimeout(function() {
            playPanel.visible = false;
        }, period*2);
        
    };

    PlayPanel.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    };

	module.exports = PlayPanel;

});