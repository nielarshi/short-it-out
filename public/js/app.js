define(function(require, exports, module){
	var Engine = require("famous/core/Engine");
	var Modifier = require("famous/core/Modifier");

	var Game = require("app/views/Game");
	var Splash = require("app/splash/Splash");
	var GameSounds = require("app/audio/GameSounds");

	var Transform = require("famous/core/Transform");
	var Timer = require("famous/utilities/Timer");

	var context = null;

	var modifier = new Modifier({
		origin : [0, 0]
	});

	function getAppDims(){
        var scaleY = window.innerHeight / 960;
        var scaleX = window.innerWidth / 640;


        //here we are going to let the bottom of the screen be cut off to allow fit to more
        //devices
        var scale = Math.min(scaleX, scaleY * 1.2);
        //var scale = 1;

        var appWidth = 640 * scale;
        var appHeight = 960 * scale;

        return [appWidth, appHeight, scale];
    }

    function _resize(container){
    	console.log('called');
        var appDims = getAppDims();
        container.style.width = appDims[0] + "px";
        container.style.height = appDims[1] + "px";

        modifier.setTransform(Transform.scale(appDims[2], appDims[2], 1));
    }

	var _init = function() {
		var contextContainer = document.getElementById("contextContainer");

		context = Engine.createContext(contextContainer);
		context.setPerspective(300);

		this.game = new Game();
		context.add(modifier).add(this.game);

		this.splash = new Splash();
		context.add(modifier).add(this.splash);

		var app = this;

		this.splash.on('click', function() {
			app.splash.hide();	
			context.add(modifier).add(app.game);
		});

		Engine.on("resize", function(){_resize(contextContainer);});
		Engine.on("orientationchange", function(){_resize(contextContainer);});
	};


	GameSounds(function(){
        
    }.bind(this));
    _init.call(this);
});