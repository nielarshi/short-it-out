define(function(require, exports, module) {

	var View = require("famous/core/View");
    var Surface = require("famous/core/Surface");
    var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
    var Transform = require("famous/core/Transform");
    var RenderNode = require("famous/core/RenderNode");
    var GridLayout = require("famous/views/GridLayout");
    var Flipper = require("famous/views/Flipper");
    var EventHandler = require("famous/core/EventHandler");

	var Levels = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};

	Levels.prototype = Object.create(View.prototype);
	Levels.prototype.constructor = Levels;

	Levels.DEFAULTS = {
		visible : true
	};

	var _createLevels = function() {
		
		var levels = this;

        if(this.options.size[0] > this.options.size[1]) {
            this.gridLayout = new GridLayout({
                dimensions : [3, 2]
            });
            this.sizeX = this.options.size[0]/8;
            this.sizeY = this.options.size[0]/8;

            this.gridModifier = new Modifier({
                size: [(4*this.sizeX) , (3*this.sizeY)],
                origin: [0.5, 0.5],
                align: [0.5, 0.5]
            });
        } else {
            this.gridLayout = new GridLayout({
                dimensions : [2, 3]
            });
            this.sizeX = this.options.size[1]/8;
            this.sizeY = this.options.size[1]/8;
            
            this.gridModifier = new Modifier({
                size: [(3*this.sizeX) , (4*this.sizeY)],
                origin: [0.5, 0.5],
                align: [0.5, 0.5]
            });
        }

        

        var flippers = [];
        this.gridLayout.sequenceFrom(flippers);

        //save game data into local storage
        var gameData = JSON.parse(localStorage.getItem("gameData"));
        if(!gameData) {
            gameData = {
                levelData : {}
            };
        }
        var keys = Object.keys(gameData.levelData);

        for(var i = 0; i < 5; i++) {
            var frontNode = new RenderNode();

            var frontModifier = new StateModifier({
                origin : [0, 0],
                size : [this.sizeX , this.sizeY]
            });

            var frontSurface = new Surface({
                content: "Level "+(i+1),
                properties: {
                    backgroundColor: "white",
                    color: 'gray',
                    lineHeight: (this.sizeY)+'px',
                    textAlign: 'center',
                    margin: '10px',
                    fontSize: '0.4em',
                    cursor: 'pointer',
                    borderRadius: '0.5em'
                }
            });

            var backNode = new RenderNode();

            var backModifier = new StateModifier({
                origin : [0, 0],
                size : [this.sizeX , this.sizeY]
            });

            var backSurface = new Surface({
                content : "Level "+(i+1),
                properties : {
                    backgroundColor: "#F1C40F",
                    color : "black",
                    lineHeight : (this.sizeY)+'px',
                    textAlign: 'center',
                    margin: '10px',
                    fontSize: '0.4em',
                    cursor: 'pointer',
                    borderRadius: '0.5em'
                }
            });

            frontNode.add(frontModifier).add(frontSurface);
            backNode.add(backModifier).add(backSurface);


            var flipper = new Flipper();
            flipper.setFront(frontNode);
            flipper.setBack(backNode);
            flippers.push(flipper);

            (function(i) {
                var key = ""+(i+1);
                if(keys.indexOf(key)!==-1) {
                    flipper.setAngle(Math.PI, {curve : 'easeOutBounce', duration : 0});
                }
                
                frontSurface.on('click', function(evt) {
                    levels.eventOutput.emit('levelopened', i);
                });

                backSurface.on('click', function() {
                    levels.eventOutput.emit('levelopened', i);
                });
            }(i));   
        }

        //coming soon grid

            var comingSoonGridFrontNode = new RenderNode();
            var comingSoonGridFrontModifier = new StateModifier({
                origin : [0, 0],
                size : [this.sizeX , this.sizeY]
            });

            var comingSoonGridFrontSurface = new Surface({
                content: "Coming soon",
                properties: {
                    backgroundColor: "#9b59b6",
                    color: 'white',
                    lineHeight: (this.sizeY)+'px',
                    textAlign: 'center',
                    margin: '10px',
                    fontSize: '0.4em',
                    cursor: 'pointer',
                    borderRadius: '0.5em'
                }
            });


            var comingSoonGridBackNode = new RenderNode();
            var comingSoonGridBackModifier = new StateModifier({
                origin : [0, 0],
                size : [this.sizeX , this.sizeY]
            });

            var comingSoonGridBackSurface = new Surface({
                content: "Coming soon",
                properties: {
                    backgroundColor: "#9b59b6",
                    color: 'white',
                    lineHeight: (this.sizeY)+'px',
                    textAlign: 'center',
                    margin: '10px',
                    fontSize: '0.4em',
                    cursor: 'pointer',
                    borderRadius: '0.5em'
                }
            });

            comingSoonGridFrontNode.add(comingSoonGridFrontModifier).add(comingSoonGridFrontSurface);
            comingSoonGridBackNode.add(comingSoonGridBackModifier).add(comingSoonGridBackSurface);
            var comingSoonGridflipper = new Flipper();
            comingSoonGridflipper.setFront(comingSoonGridFrontNode);
            comingSoonGridflipper.setBack(comingSoonGridBackNode);
            flippers.push(comingSoonGridflipper);
        
	};

	var _create = function() {
		this.visible = Levels.DEFAULTS.visible;
		this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        _createLevels.call(this);
	};

	var _init = function() {
		this.add(this.gridModifier).add(this.gridLayout);
	};

	Levels.prototype.show = function() {
		this.visible = true;
	};

	Levels.prototype.hide = function() {
		this.visible = false;
	};

	Levels.prototype.render = function render() {
		return this.visible ? this._node.render() : undefined;
	}

	module.exports = Levels;
});