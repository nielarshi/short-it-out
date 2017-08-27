define(function(require, exports, module) {
	
	var BouncingPanel = require("app/widgets/BouncingPanel");

	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
	var Transform = require("famous/core/Transform");
	var RenderNode = require("famous/core/RenderNode");
	var GridLayout = require("famous/views/GridLayout");
    var EventHandler = require("famous/core/EventHandler");

    var GameSounds = require("app/audio/GameSounds");
    
	var SettingsPanel = function() {
		View.apply(this, arguments);

        _create.call(this);
		_init.call(this);   
	}
	SettingsPanel.prototype = Object.create(View.prototype);
	SettingsPanel.prototype.constructor = SettingsPanel;

    SettingsPanel.DEFAULT = {
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

        var settingsPanel = this;
        this.closeButton.on('click', function(evt) {
            GameSounds().playSound(4);
            settingsPanel.hide();
        });

        //title
        this.titleModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.5, 0]
        });
        this.titleText = new Surface({
            content : "Settings",
            size: [true, true],
            properties: {
                fontSize: '0.8em'
            }
        });     

    };

    var getVolumeText = function() {
        var volume = GameSounds().getVolume();
        if(volume===0) {
            return "No";
        } else {
            return "Yes"
        }
    }

    var _createAudioSetting = function() {

        this.audioModifier = new Modifier({
            origin : [0.5, 0.5],
            align : [0.5, 0.8]
        });

        this.audioText = new Surface({
            content : "<div><span class='audio-text'>Audio  : </span><span>"+getVolumeText()+"</span>",
            properties : {

            }
        });

        var settingsPanel = this;
        this.audioText.on('click', function() {
            if(GameSounds().getVolume()!==0) {
                GameSounds().setVolume(0);
            } else {
                GameSounds().setVolume();
            }
            
            settingsPanel.eventOutput.emit('audiosetting.changed');
        });
    };

    var _create = function() {

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        //background panel
        this.backgroundPanel = new BouncingPanel({
            size : this.options.size || [],
            classes : this.options.classes
        });

        _createHeaderSection.call(this);
        _createAudioSetting.call(this);
           
    };

	var _init = function() {
		
        this.backgroundPanel.show();
        this.backgroundPanel.getContainer().add(this.titleModifier).add(this.titleText);   
        this.backgroundPanel.getContainer().add(this.closeModifier).add(this.closeButton); 
        this.backgroundPanel.getContainer().add(this.audioModifier).add(this.audioText); 
    	this.add(this.backgroundPanel);
	};

    SettingsPanel.prototype.show = function(){
        this.visible = true;
    };

    SettingsPanel.prototype.hide = function(){
        var settingsPanel = this;
        var period = this.backgroundPanel.getTransitionPeriod();
        this.backgroundPanel.hide();
        setTimeout(function() {
            settingsPanel.visible = false;
        }, period*2);
        
    };

    SettingsPanel.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    };

	module.exports = SettingsPanel;

});