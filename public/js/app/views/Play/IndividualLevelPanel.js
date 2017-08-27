define(function(require, exports, module){

	var BouncingPanel = require("app/widgets/BouncingPanel");
	var GridMesh = require("app/views/Play/GridMesh");
	var View = require("famous/core/View");
    var Surface = require("famous/core/Surface");
    var Modifier = require("famous/core/Modifier");
    var EventHandler = require("famous/core/EventHandler");



	var IndividualLevelPanel = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	}

	IndividualLevelPanel.prototype = Object.create(View.prototype);
	IndividualLevelPanel.prototype.constructor = IndividualLevelPanel;

	IndividualLevelPanel.DEFAULTS = {
		visible : false
	};

	var _createCloseButton = function() {
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

        var levelPanel = this;
        this.closeButton.on('click', function(evt) {
        	levelPanel.eventOutput.emit('levelclosed', (levelPanel.options.level - 1));
        });
	};

	var _createTitleSection = function() {
		//title
        this.titleModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.5, 0]
        });
        this.titleText = new Surface({
            content : "Level "+this.options.level,
            size: [true, true],
            properties : {
            	padding : '2px',
            	fontSize : '0.8em',
            	color : 'black'
            }
        }); 
	};

	var _createReloadButton = function() {
		this.reloadModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.9, 0]
        });
        this.reloadButton = new Surface({
            content : "Reload",
            size : [true, true],
            properties : {
                fontSize: '0.7em'
            }
        });
        var levelPanel = this;
        this.reloadButton.on('click', function(evt) {
            levelPanel.eventOutput.emit('levelreload', (levelPanel.options.level - 1));
        });
	};

	var _createHeaderSection = function() {

		_createCloseButton.call(this);
		_createTitleSection.call(this);
        _createReloadButton.call(this);
  
	};

	var _createGridMesh = function() {
		var dimensions = [];

		switch(this.options.level) {
			case 1 : 
				dimensions = [5, 5];
				break;
			case 2 :
				dimensions = [5, 6];
				break;
			case 3 :
				dimensions = [6, 6];
				break;
			case 4 :
				dimensions = [7, 5];
				break;
			case 5 :
				dimensions = [7, 6];
				break;
			case 6 :
				dimensions = [8, 7];
				break;
			case 7 :
				dimensions = [9, 8];
				break;
			case 8 :
				dimensions = [12, 8];
				break;
			case 9 :
				dimensions = [14, 8];
				break;
			default : 
				dimensions = [15, 8];
		}

		this.gridMesh = new GridMesh({
			dimensions : dimensions,
			level : this.options.level,
			size : this.options.size
		});
		this.gridMesh.show();

		var levelPanel = this;
		this.gridMesh.on('scoreclosed', function() {
			levelPanel.eventOutput.emit('levelclosed', (levelPanel.options.level - 1));
		});
	};

	var _create = function() {

		this.backgroundPanel = new BouncingPanel({
            size : this.options.size || [],
            classes : this.options.classes
        });

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

		_createHeaderSection.call(this);

		_createGridMesh.call(this);
	};

	var _init = function() {
		
		this.backgroundPanel.getContainer().add(this.closeModifier).add(this.closeButton);
		this.backgroundPanel.getContainer().add(this.titleModifier).add(this.titleText);
		this.backgroundPanel.getContainer().add(this.reloadModifier).add(this.reloadButton);
		this.backgroundPanel.getContainer().add(this.gridMesh);
		this.add(this.backgroundPanel);

		this.backgroundPanel.show();
	};

	IndividualLevelPanel.prototype.show = function(){
        this.visible = true;
    };

    IndividualLevelPanel.prototype.hide = function(){
        var levelPanel = this;
        var period = this.backgroundPanel.getTransitionPeriod();
        this.backgroundPanel.hide();
        setTimeout(function() {
            levelPanel.visible = false;
        }, period*2);
        
    };

    IndividualLevelPanel.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    };

	module.exports = IndividualLevelPanel;
});