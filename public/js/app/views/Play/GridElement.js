define(function(require, exports, module) {
	var Surface = require('famous/core/Surface');
	var View = require('famous/core/View');

	var GridElement = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};

	GridElement.prototype = Object.create(View.prototype);
	GridElement.prototype.constructor = GridElement;
	GridElement.DEFAULTS = {
		visible : true
	};

	var _create = function() {
		this.visible = GridElement.DEFAULTS.visible;
		this.surface = new Surface({
        	content: this.options.content,
        	classes: this.options.classes,
        	properties: {
            	lineHeight: this.options.size+'px',
            	borderRadius: '10px',
            	textAlign: 'center',
            	fontSize: '30px',
            	cursor: 'pointer'
        	}
    	});
	};

	var _init = function() {
		this.add(this.surface);
	};

	GridElement.prototype.surface = this.surface;

	GridElement.prototype.show = function() {
		this.visible = true;
	};

	GridElement.prototype.hide = function() {
		this.visible = false;
	};

	GridElement.prototype.render = function render() {
		return this.visible ? this._node.render() : undefined;
	};

	module.exports = GridElement;

});