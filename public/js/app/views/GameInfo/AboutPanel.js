define(function(require, exports, module) {
	
	var BouncingPanel = require("app/widgets/BouncingPanel");
	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
	var Modifier = require("famous/core/Modifier");

	var GameSounds = require("app/audio/GameSounds");
	var ScrollContainer = require("famous/views/ScrollContainer");

	var AboutPanel = function() {
		View.apply(this, arguments);

		_create.call(this);
		_init.call(this);
	};
	AboutPanel.prototype = Object.create(View.prototype);
	AboutPanel.prototype.constructor = AboutPanel;

	var _createHeaderSection = function() {

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

        var aboutPanel = this;
        this.closeButton.on('click', function(evt) {
            GameSounds().playSound(4);
            aboutPanel.hide();
        });

        //title
        this.titleModifier = new Modifier({
            origin : [0.5, 0],
            align : [0.5, 0]
        });
        this.titleText = new Surface({
            content : "About the game",
            size: [true, true],
            properties: {
            	fontSize: '0.8em'
            }
        });     

    };

    var _createContent = function() {
    	this.scrollModifier = new Modifier({
    		origin : [0.5, 0.5],
    		align : [0.5, 0.55],
    		size : [undefined, this.options.size[1]*0.9]
    	});

    	this.scrollContainer = new ScrollContainer();

    	var surfaces = [];

    	var content =  "<div class='about-div'>"
    						+"<p class='about-main'>Short-it-out is a Brain Training Game which expects player to connect all the marked blocks via the shortest route available.</p>"
    						+"<p class='about-main'>It presents M*N grid matrix, which has several blocks spread across the grids. Everytime a level is opened, these blocks are randomly placed to make the game more interesting.</p>"
    						+"<ul>"
    							+"<li>"
    								+"<p>Start from any of the block by holding and dragging it to connect it to any of the remaining coloured block.</p>"
    								+"<img src='content/img/1.png'/>"
    							+"</li>"
    							+"<li>"
    								+"<p>Once 1st connection is made, the block to which the connection is made becomes active for next connection with any of the remaining blocks.</p>"
    								+"<img src='content/img/2.png'/>"
    							+"</li>"
    							+"<li>"
    								+"<p>Once next connection is made, the block to which the connection is made becomes active for next connection with any of the remaining blocks.</p>"
    								+"<img src='content/img/3.png'/>"
    							+"</li>"
    							+"<li>"
    								+"<p>Continue the same process for connecting all the blocks.</p>"
    								+"<img src='content/img/4.png'/>"
    								+"<img src='content/img/5.png'/>"
    							+"</li>"
    						+"</ul>"
    						+"<p class='about-main'>While connecting, keep in mind that the lesser block you cross to connect all the coloured blocks, the better your score would be.</p>"
    					    +"<img src='content/img/6.png'/>"
                        +"</div>";

    	var contentSurface = new Surface({
    		content : content,
            size : [undefined, true]
    	});

    	this.scrollContainer.sequenceFrom(surfaces);

    	contentSurface.pipe(this.scrollContainer);

    	surfaces.push(contentSurface);
    };

	var _create = function() {

		this.backgroundModifier = new Modifier({
			opacity : 1
		});

		this.backgroundPanel = new BouncingPanel({
			size : this.options.size,
			classes : this.options.classes
		});

		_createHeaderSection.call(this);
		_createContent.call(this);
	};

	var _init = function() {
		this.backgroundPanel.show();
        this.backgroundPanel.getContainer().add(this.titleModifier).add(this.titleText);   
        this.backgroundPanel.getContainer().add(this.closeModifier).add(this.closeButton); 
        this.backgroundPanel.getContainer().add(this.scrollModifier).add(this.scrollContainer);
    	this.add(this.backgroundModifier).add(this.backgroundPanel);
	};

	AboutPanel.prototype.show = function() {
		this.visible = true;
	};

	AboutPanel.prototype.hide = function() {
		var aboutPanel = this;
        var period = this.backgroundPanel.getTransitionPeriod();
        this.backgroundPanel.hide();
        setTimeout(function() {
            aboutPanel.visible = false;
        }, period*2);
	};

	AboutPanel.prototype.render = function render() {
		return this.visible ? this._node.render() : undefined;
	};

	module.exports = AboutPanel;


});