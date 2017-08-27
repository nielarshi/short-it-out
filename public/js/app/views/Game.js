define(function(require, exports, module) {
	var View = require("famous/core/View");
	
	var WelcomePanel = require("app/views/WelcomePanel");

	var Game = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};
	Game.prototype = Object.create(View.prototype);
	Game.prototype.constructor = Game;

	var _create = function() {
		var scaleY = window.innerHeight;
        var scaleX = window.innerWidth;

		this.welcomePanel = new WelcomePanel({
			size : [scaleX, scaleY]
		});
	};

	var _init = function() {
		this.add(this.welcomePanel);
	};

	Game.prototype.show = function() {
		
	};

	module.exports = Game;
});