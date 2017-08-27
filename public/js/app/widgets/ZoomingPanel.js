define(function(require, exports, module) {

	var View = require("famous/core/View");
	var ContainerSurface = require("famous/surfaces/ContainerSurface");
	var Modifier = require("famous/core/Modifier");
	var Transform = require("famous/core/Transform");
	var Transitionable = require("famous/transitions/Transitionable");
	var SnapTransition = require("famous/transitions/SnapTransition");

	Transitionable.registerMethod("wall", SnapTransition);

	var ZoomingPanel = function(options) {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};
	ZoomingPanel.prototype = Object.create(View.prototype);
	ZoomingPanel.prototype.constructor = ZoomingPanel;

	ZoomingPanel.DEFAULTS = {
		visible : false,
		transition : {
        	method: 'wall',
        	period: 100,
        	dampingRatio : 0,
        	velocity: 0,
        	restitution : .3
    	}
	}

	var _createZoomingPanel = function() {

		var containerSurface = new ContainerSurface({
            size : this.options.size,
            classes : this.options.classes
		});

		this.x = this.options.size[0];
		this.y = this.options.size[1];

		this.scaleX = this.x/100;
		this.scaleY = this.y/100;

		var containerModifier = new Modifier({
			transform : Transform.scale(this.scaleX/this.x, this.scaleY/this.y, 1)
		});

        return {
        	modifier : containerModifier,
        	surface : containerSurface
        }
	};

	var _create = function() {
		this.visible = this.options.visible;
		this.panel = _createZoomingPanel.call(this);
	};

	var _init = function() {
		this.add(this.panel.modifier).add(this.panel.surface);
	};

	ZoomingPanel.prototype.show = function(){
		this.panel.modifier.setTransform(Transform.scale(1, 1, 1), ZoomingPanel.DEFAULTS.transition);
        this.visible = true;
    }

    ZoomingPanel.prototype.hide = function(){
    	this.panel.modifier.setTransform(Transform.scale(this.scaleX/this.x, this.scaleY/this.y, 1), ZoomingPanel.DEFAULTS.transition);
        setTimeout(function() {
        	 this.visible = false;
        }, ZoomingPanel.DEFAULTS.transition.period);
    }

    ZoomingPanel.prototype.getTransitionPeriod = function() {
    	return ZoomingPanel.DEFAULTS.transition.period;
    };

    ZoomingPanel.prototype.render = function () {
        return this.visible ? this._node.render() : undefined;
    }

	ZoomingPanel.prototype.getContainer = function() {
		return this.panel.surface;
	}

	module.exports = ZoomingPanel;

});