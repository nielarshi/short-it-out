define(function(require, exports, module){
	
	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");

	var Transform = require("famous/core/Transform");

	var Splash = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};
	Splash.prototype = Object.create(View.prototype);
	Splash.prototype.constructor = Splash;

	var _create = function() {

		this.scaleY = window.innerHeight;
        this.scaleX = window.innerWidth;

		this.modifier = new Modifier({
			origin : [0, 0],
			align : [0, 0]
		});

		this.surface = new Surface({
			content : "<div class='game-name'>Short It Out</div><div class='game-name-sub'>Tap anywhere to proceed</div>",
			size : [this.scaleX, this.scaleY],
			properties : {
				background : '#ff7764',
				paddingTop : '18%',
				textAlign : 'center'
			}

		});

		this.surface.pipe(this._eventOutput);

		this.add(this.modifier).add(this.surface);
	};

	var _init = function() {
		this.show();
	};

	Splash.prototype.show = function(){
        this.visible = true;
    };

    Splash.prototype.hide = function(){
    	this.modifier.setTransform(Transform.translate(0, this.scaleY+100, 0));
        this.visible = false;
        
    };

    Splash.prototype.render = function render(){
        return this.visible ? this._node.render() : undefined;
    };

	module.exports = Splash;
});