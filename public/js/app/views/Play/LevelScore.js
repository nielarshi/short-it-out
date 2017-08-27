define(function(require, exports, module) {

	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");
	var BouncingPanel = require("app/widgets/BouncingPanel");

	var EventHandler = require("famous/core/EventHandler");

	var LevelScore = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};

	LevelScore.prototype = Object.create(View.prototype);
	LevelScore.prototype.constructor = LevelScore;

	LevelScore.DEFAULTS = {
		visible : false
	};


	var _create = function() {
		var scaleY = window.innerHeight - 60;
        var scaleX = window.innerWidth - 60;

        this.backgroundPanel = new BouncingPanel({
            size : [scaleX, scaleY],
            classes : ["score-panel"],
            properties : {
            	borderRadius: '100%'
            }
        });
        this.backgroundPanel.show();

        this.closeModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.05, 0.01]
        });
        this.closeButton = new Surface({
            content : "Close",
            size : [true, true],
            properties : {
                fontSize: '40px'
            }
        });

        var scorePanel = this;
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.closeButton.on('click', function(evt) {
            scorePanel.hide();
            scorePanel.eventOutput.emit('scoreclosed', scorePanel.options.score);
        });

        //title
        this.titleModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.5, 0]
        });
        this.titleText = new Surface({
            content : "Score",
            size: [true, true]
        });  

        this.scoreModifier = new Modifier({
            origin : [0.5, 0.5],
            align : [0.5, 0.5]
        });
        this.scoreText = new Surface({
            content : this.options.score,
            size: [true, true],
            properties : {
            	padding: '15px',
            	fontSize: '2em'
            }
        }); 

        this.centerModifier = new Modifier({
        	origin : [0.5, 0.5],
        	align : [0.5, 0.5]
        });

	};

	var _init = function() {
		this.backgroundPanel.getContainer().add(this.closeModifier).add(this.closeButton);
		this.backgroundPanel.getContainer().add(this.titleModifier).add(this.titleText);
		this.backgroundPanel.getContainer().add(this.scoreModifier).add(this.scoreText);
		this.add(this.centerModifier).add(this.backgroundPanel);
	};

	LevelScore.prototype.show = function() {
    	this.visible = true;
	};

	LevelScore.prototype.hide = function() {
		var scorePanel = this;
        var period = this.backgroundPanel.getTransitionPeriod();
        this.backgroundPanel.hide();
        setTimeout(function() {
            scorePanel.visible = false;
        }, period*2);
	};

	LevelScore.prototype.render = function render() {
    	return this.visible ? this._node.render() : undefined;
	}

	module.exports = LevelScore;
});