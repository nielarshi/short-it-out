define(function(require, exports, module) {

	var View = require("famous/core/View");
	var ContainerSurface = require("famous/surfaces/ContainerSurface");
	var Modifier = require("famous/core/Modifier");
	var Transform = require("famous/core/Transform");
	var Transitionable = require("famous/transitions/Transitionable");
	var SnapTransition = require("famous/transitions/SnapTransition");

	Transitionable.registerMethod("wall", SnapTransition);

	var BouncingPanel = function(options) {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};
	BouncingPanel.prototype = Object.create(View.prototype);
	BouncingPanel.prototype.constructor = BouncingPanel;

	BouncingPanel.DEFAULTS = {
		visible : false,
		transition : {
        	method: 'wall',
        	period: 200,
        	dampingRatio : 0,
        	velocity: 0,
        	restitution : .1
    	}
	}

	var _createBouncingPanel = function() {

		var containerSurface = new ContainerSurface({
            size : this.options.size || [],
            classes : this.options.classes
		});

		var containerModifier = new Modifier({
			transform : Transform.translate(0, 400, 0)
		});

        return {
        	modifier : containerModifier,
        	surface : containerSurface
        }
	};

	var _create = function() {
		this.visible = this.options.visible;
		this.panel = _createBouncingPanel.call(this);
	};

	var _init = function() {
		this.add(this.panel.modifier).add(this.panel.surface);
	};

	BouncingPanel.prototype.show = function(){
		this.panel.modifier.setTransform(Transform.translate(0, 0, 0), BouncingPanel.DEFAULTS.transition);
        this.visible = true;
    }

    BouncingPanel.prototype.hide = function(){
    	this.panel.modifier.setTransform(Transform.translate(0, this.options.size[1], 0), BouncingPanel.DEFAULTS.transition);
        setTimeout(function() {
        	 this.visible = false;
        }, BouncingPanel.DEFAULTS.transition.period);
    }

    BouncingPanel.prototype.getTransitionPeriod = function() {
    	return BouncingPanel.DEFAULTS.transition.period;
    };

    BouncingPanel.prototype.render = function () {
        return this.visible ? this._node.render() : undefined;
    }

	BouncingPanel.prototype.getContainer = function() {
		return this.panel.surface;
	}

	module.exports = BouncingPanel;

});