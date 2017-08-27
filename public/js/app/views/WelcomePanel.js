define(function(require, exports, module) {
	
	var BouncingPanel = require("app/widgets/BouncingPanel");
    var PlayPanel = require("app/views/Play/PlayPanel");
    var SettingsPanel = require("app/views/Settings/SettingsPanel");
    var HistoryPanel = require("app/views/History/HistoryPanel");
    var AboutPanel = require("app/views/GameInfo/AboutPanel");

	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
	var Transform = require("famous/core/Transform");
	var RenderNode = require("famous/core/RenderNode");
	var GridLayout = require("famous/views/GridLayout");

    var GameSounds = require("app/audio/GameSounds");
    
	var WelcomePanel = function() {
		View.apply(this, arguments);

        _create.call(this);
		_init.call(this);   
	}
	WelcomePanel.prototype = Object.create(View.prototype);
	WelcomePanel.prototype.constructor = WelcomePanel;

    var _createOptionGrid = function() {
        var welcomePanel = this;
        var gridLayout = new GridLayout({
            dimensions: [2, 2]
        });

        var surfaces = [];
        gridLayout.sequenceFrom(surfaces);

        var optionList = [
            "Play",
            "Settings",
            "History",
            "How to play"
        ];

        var modifiers = [];

        //for landscape and portrait mode
        if(this.options.size[0] > this.options.size[1]) {
            this.size = this.options.size[1]/4;
        } else {
            this.size = this.options.size[0]/3;
        }
        

        for(var i = 0; i < 4; i++) {
            var surfaceNode = new RenderNode();

            
            var tempModifier = new StateModifier({
                origin : [0, 0],
                size : [this.size, this.size]
            });

            modifiers[i] = tempModifier;

            var tempSurface = new Surface({
                content: optionList[i],
                properties: {
                    backgroundColor: "hsl(" + (3 * 360 / 24) + ", 100%, 50%)",
                    color: 'red',
                    lineHeight: this.size+"px",
                    borderRadius: '10px',
                    textAlign: 'center',
                    margin: '10px',
                    fontSize: '0.5em',
                    cursor: 'pointer'
                }
            });

            surfaceNode.add(tempModifier).add(tempSurface);
            surfaces.push(surfaceNode);

            (function(i) {
                tempSurface.on('click', function(evt) {

                    //attach audio on selecting option
                    GameSounds().playSound(4);

                    //animate clicked option
                    modifiers[i].setTransform(Transform.translate(0, 40, 0));
                    var transitionUp = {
                        method: 'wall',
                        period: 200,
                        dampingRatio : 0,
                        velocity: 0,
                        restitution : .1
                    };
                    modifiers[i].setTransform(Transform.translate(0, 0, 0), transitionUp);

                    _addPanel.call(welcomePanel, i);
                });
            }(i));
        }

        var gridModifier = new Modifier({
            size: [this.size*3, this.size*3],
            origin: [0.45, 0.40],
            align: [0.5, 0.5]
        });

        var renderNode = new RenderNode();
        renderNode.add(gridModifier).add(gridLayout);

        return renderNode;

    };

    var _create = function() {
        //background panel
        this.backgroundPanel = new BouncingPanel({
            size : this.options.size || [],
            classes : ["welcome-panel"]
        });
        this.backgroundPanel.show();
        
        //header
        this.header = new Surface({
            content : "Short it out"   
        });

        //option grid
        this.optionGrid = _createOptionGrid.call(this);

        
    };

	var _init = function() {
		
        this.add(this.backgroundPanel);
        this.backgroundPanel.getContainer().add(this.header); 
        this.backgroundPanel.getContainer().add(this.optionGrid);


        //if first time opening app show about the game screen
        var alreadyViewed = localStorage.getItem('viewed');
        if(alreadyViewed===undefined || !alreadyViewed) {
            _addPanel.call(this, 3);
            localStorage.setItem('viewed', true);
        }

	};

    var _addPanel = function(i) {
        switch(i) {
            case 0 :
                this.playPanel = new PlayPanel({
                    size : this.options.size || [],
                    classes : ["play-panel"]
                });
                this.playPanel.show();
                this.add(this.playPanel);
                break;
            case 1 :
                this.settingsPanel = new SettingsPanel({
                    size : this.options.size || [],
                    classes : ["settings-panel"]
                });

                var welcomePanel = this;
                this.settingsPanel.on('audiosetting.changed', function() {
                    welcomePanel.settingsPanel.hide();
                    _addPanel.call(welcomePanel, 1);
                });

                this.settingsPanel.show();
                this.add(this.settingsPanel);
                break;
            case 2 : 
                this.historyPanel = new HistoryPanel({
                    size : this.options.size || [],
                    classes : ["history-panel"]
                });
                this.historyPanel.show();
                this.add(this.historyPanel);
                break;
            case 3 : 
                this.aboutPanel = new AboutPanel({
                    size : this.options.size || [],
                    classes : ["about-panel"]
                });
                this.aboutPanel.show();
                this.add(this.aboutPanel);
        } 
    };

	module.exports = WelcomePanel;

});