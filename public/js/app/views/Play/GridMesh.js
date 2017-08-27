define(function(require, exports, module) {
	var GridLayout = require("famous/views/GridLayout");

	var View = require("famous/core/View");
	var Surface = require("famous/core/Surface");
    var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
    var Transform = require("famous/core/Transform");
    var RenderNode = require("famous/core/RenderNode");
    var GridMeshAssigner = require("app/helpers/GridMeshAssigner");
    var Draggable = require('famous/modifiers/Draggable');
    var Transitionable = require("famous/transitions/Transitionable");
    var SnapTransition = require("famous/transitions/SnapTransition");
    var Flipper    = require("famous/views/Flipper");
    var GridElement = require('app/views/Play/GridElement');
    var ScorePanel = require('app/views/Play/LevelScore');
    var EventHandler = require("famous/core/EventHandler");
    var RenderController = require("famous/views/RenderController");
    var GameSounds = require("app/audio/GameSounds");
    var ScoreCalculator = require("app/helpers/ScoreCalculator");

    Transitionable.registerMethod("snap", SnapTransition);

    var GridMesh = function() {
        View.apply(this, arguments);

        _create.call(this);
        _init.call(this);
    };

  GridMesh.prototype = Object.create(View.prototype);
  GridMesh.prototype.constructor = GridMesh;

  GridMesh.DEFAULTS = {
    visible : true,
    transition : {
        method : 'snap',
        period : 300,
        dampingRatio : 0.3,
        velocity : 0
    }
};

var _createGrid = function() {
    var gridLayout = new GridLayout({
        dimensions : this.options.dimensions
    });

    var surfaces = [];
    gridLayout.sequenceFrom(surfaces);

    var noOfGrids = this.options.dimensions[0]*this.options.dimensions[1];

    if(this.options.size[0] > this.options.size[1]) {
        var sizeX = this.options.size[1]/(this.options.dimensions[1]+3);
        var sizeY = this.options.size[1]/(this.options.dimensions[1]+3);
        this.sizeOfEachGrid = [sizeX, sizeY];
    } else {
        var tempY = this.options.dimensions[1];
        this.options.dimensions[1] = this.options.dimensions[0];
        this.options.dimensions[0] = tempY;

        var max = (this.options.dimensions[0] >= this.options.dimensions[1]) ? this.options.dimensions[0] : this.options.dimensions[1];
        var sizeX = this.options.size[0]/(this.options.dimensions[0]+3);
        var sizeY = this.options.size[0]/(this.options.dimensions[0]+3);
        this.sizeOfEachGrid = [sizeX, sizeY];
    }
    

    for(var i = 0; i < noOfGrids; i++) {
       var surfaceNode = new RenderNode();

        var tempModifier = new StateModifier({
            origin : [0, 0],
            size : this.sizeOfEachGrid
        });

        var tempSurface = new Surface({
            classes: ['back-grid'],
            properties: {
                lineHeight: this.sizeOfEachGrid[0]+'px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '30px',
                cursor: 'pointer'
            }
        });

        surfaceNode.add(tempModifier).add(tempSurface);
        surfaces.push(surfaceNode);
    };

    var gridModifier = new Modifier({
        size: [this.options.dimensions[0]*this.sizeOfEachGrid[0], this.options.dimensions[1]*this.sizeOfEachGrid[1]],
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });
    var renderNode = new RenderNode();
    renderNode.add(gridModifier).add(gridLayout);

    this.gridMesh = renderNode;
};

var _createHighlightedGrid = function() {

    var gridLayout = new GridLayout({
        dimensions : this.options.dimensions
    });

    var surfaces = [];
    gridLayout.sequenceFrom(surfaces);

    var noOfGrids = this.options.dimensions[0]*this.options.dimensions[1];

    for(var i = 0; i < noOfGrids; i++) {
        var surfaceNode = new RenderNode();

        var tempModifier = new StateModifier({
            origin : [0.5, 0.5],
            align : [0.5, 0.5],
            size : this.sizeOfEachGrid
        });

        this.lineSize = 8;

        if(this.assignedGrids.indexOf(i)!==-1) {
            var tempSurface = new Surface({
                properties: {
                    backgroundColor: '#9b59b6',
                    borderRadius: '100%',
                    textAlign: 'center',
                    border: '1px solid black',
                    fontSize: '30px',
                    cursor: 'pointer'
                }
            });
            surfaceNode.add(tempModifier).add(tempSurface);
        }
        surfaces.push(surfaceNode);
    }

    var gridModifier = new Modifier({
        size: [this.options.dimensions[0]*this.sizeOfEachGrid[0], this.options.dimensions[1]*this.sizeOfEachGrid[1]],
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });

    var renderNode = new RenderNode({
        properties :{
            borderRadius: '20px'
        }
    });
    renderNode.add(gridModifier).add(gridLayout);
    this.gridMeshDabba = renderNode;
};

var _isInSameRow = function(elementIndex, nextIndex) {
    var rowIndexOfElement = Math.floor((elementIndex) / this.options.dimensions[0]);
    var rowIndexOfNext = Math.floor((nextIndex) / this.options.dimensions[0]);

    if(rowIndexOfElement===rowIndexOfNext) {
        return true;
    }
    return false;
};

var _isInSameColumn = function() {
    var columnIndexOfElement = ((elementIndex) % this.options.dimensions[0]);
    var columnIndexOfNext = ((nextIndex) % this.options.dimensions[0]);

    if(columnIndexOfElement===columnIndexOfNext) {
        return true;
    }
    return false;
};

var _isBefore = function(elementIndex, nextIndex) {
    if(elementIndex < nextIndex) {
        return true;
    }
    return false;
};

var _turnedTo = function(elementIndex, nextIndex) {
    var hasTurnedLeft = ((elementIndex - nextIndex) === 1);
    var hasTurnedRight = ((elementIndex - nextIndex) === -1);

    var hasTurnedDown = ((elementIndex - nextIndex) === -(this.options.dimensions[0]));

    var hasTurnedUp = ((elementIndex - nextIndex) === (this.options.dimensions[0]));

    if(hasTurnedLeft) {
        return 'left';
    } else if(hasTurnedRight) {
        return 'right';
    } else if(hasTurnedDown) {
        return 'down';
    } else if(hasTurnedUp) {
        return 'up';
    } else {
        return 'no';
    }
};

var getElementForPositionOf = function(index) {
  var dimensionX = this.options.dimensions[0];
  var dimensionY = this.options.dimensions[1];

  var xBlocks = this.sizeOfEachGrid[0];
  var yBlocks = this.sizeOfEachGrid[1];

  var position = this.draggables[index].getPosition();

  var x = position[0];
  var y = position[1];
  var z = position[2];

  var blockRow = x / xBlocks;
  var blockColumn = y / yBlocks;

  var newBlockIndex = Number(index) + Number(blockRow) + Number(blockColumn*Number(dimensionX));

  return Math.ceil(newBlockIndex);
};

var checkForElementInAssignedGrid = function(assignedGrids, newBlockIndex) {
    if(assignedGrids.indexOf(newBlockIndex)!=-1) {
        return true;
    } else {
        return false;
    }
};

var checkForElement = function(index) {

  var assignedGrids = this.assignedGrids;
  var newBlockIndex = getElementForPositionOf.call(this, index);

  return checkForElementInAssignedGrid(assignedGrids, newBlockIndex);

};

var _constructLines = function(hasTurnedTo, hasTurnedFrom, elementIndex, currentForNext) {
    var line1Origin = [0.5, 0.5];
    var line2Origin = [0.5, 0.5];
    var angle = 0;
    var half = 2;

    if(hasTurnedTo==='right' || hasTurnedTo==='left') {
        this.flippersBackModifiers[elementIndex*2].setTransform(Transform.rotateAxis([0,0,1], Math.PI/180 * 0));
        angle = 0;
        if(hasTurnedFrom==='up') {
            if(hasTurnedTo==="left") {
                line1Origin = [0, 0.5];
                line2Origin = [1, 0.5];
            } else if(hasTurnedTo==="right") {
                line1Origin = [0, 0.5];
                line2Origin = [0, 0.5];
            }
        } else if(hasTurnedFrom==='down') {
            if(hasTurnedTo==="right") {
                line1Origin = [1, 0.5];
                line2Origin = [0, 0.5];  
            } else if(hasTurnedTo==="left") {
                line1Origin = [1, 0.5];
                line2Origin = [1, 0.5];

            }
        } else {
            half = 1;
        }
    } else if(hasTurnedTo==='up' || hasTurnedTo==='down'){
        this.flippersBackModifiers[elementIndex*2].setTransform(Transform.rotateAxis([0,0,1], Math.PI/180 * 90));
        this.flippersBackModifiers[(elementIndex*2)+1].setTransform(Transform.rotateAxis([0,0,1], Math.PI/180 * 90));
        angle = 90;
        if(hasTurnedFrom==='left') {
            if(hasTurnedTo==="down") {
                line1Origin = [0, 0.5];
                line2Origin = [0, 0.5];

            } else if(hasTurnedTo==="up") {
                line1Origin = [0, 0.5];
                line2Origin = [1, 0.5];

            }
        } else if(hasTurnedFrom==='right') {
            if(hasTurnedTo==="down") {
                line1Origin = [1, 0.5];
                line2Origin = [0, 0.5];

            } else if(hasTurnedTo==="up") {
                line1Origin = [1, 0.5];
                line2Origin = [1, 0.5];

            }
        } else {
            half = 1;
        }
    }
    if(this.flippersBackModifiers[(currentForNext*2)+1]) {
        this.flippersBackModifiers[(currentForNext*2)].setSize([this.sizeOfEachGrid[0]/half, this.lineSize], { duration : 300 });
        this.flippersBackModifiers[(currentForNext*2)].setOrigin(line1Origin, { duration : 300 });
        this.flippersBackModifiers[(currentForNext*2)+1].setTransform(Transform.rotateAxis([0,0,1], Math.PI/180 * angle));
        this.flippersBackModifiers[(currentForNext*2)+1].setSize([this.sizeOfEachGrid[0]/half, this.lineSize], { duration : 300 });
        this.flippersBackModifiers[(currentForNext*2)+1].setOrigin(line2Origin, { duration : 300 });
    }      
};

var _createFlipperContainer = function(i) {
    var content = "";
    var classes = ['unassigned-grid'];
    var backClasses = "";
    if(this.assignedGrids.indexOf(i)!==-1) {
        content = "";
        classes = ['assigned-grid'];
        backClasses = ['assigned-grid', 'active-grid'];
    }
    
    var frontSurface = new GridElement({
        content : content,
        classes : classes
    });

    var backSurface = new GridElement({
        content : content,
        classes : backClasses
    });

    var angleModifier1 = new StateModifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });

    var tempBackSurface1 = new Surface({
        size : [undefined, this.lineSize],
        properties : {
            backgroundColor: '#27AE60',
            borderRadius: '6px'
        }
    });


    var angleModifier2 = new StateModifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });

    var tempBackSurface2 = new Surface({
        size : [undefined, this.lineSize],
        properties : {
            backgroundColor: '#27AE60',
            borderRadius: '6px'
        }
    });

    var renderBackNode = new RenderNode();

    angleModifier1.setTransform(Transform.rotateAxis([0,0,1], Math.PI/180 * 90));
    angleModifier2.setTransform(Transform.rotateAxis([0,0,1], Math.PI/180 * 0));
    renderBackNode.add(angleModifier1).add(tempBackSurface1);
    renderBackNode.add(angleModifier2).add(tempBackSurface2);

    var flipper = new Flipper();

    var renderFrontNode = new RenderNode();

    renderFrontNode.add(frontSurface);
    renderFrontNode.add(backSurface);

    var renderController = new RenderController();
    renderController.show(frontSurface);

    flipper.setFront(frontSurface);
    flipper.setBack(renderBackNode);

    this.flippersBackModifiers.push(angleModifier1);
    this.flippersBackModifiers.push(angleModifier2);

    return {
        frontPanel : {
            frontSurface : frontSurface,
            backSurface : backSurface
        },
        backPanel : renderBackNode,
        flipper : flipper
    };
};

var _createDraggableFor = function(i) {
    var rowIndex = Math.floor((i) / this.options.dimensions[0]);
    var columnIndex = ((i) % this.options.dimensions[0]);

    var xRange1 = (columnIndex*this.sizeOfEachGrid[0]+(this.sizeOfEachGrid[0]/2));
    var xRange2 = ((this.options.dimensions[0]-columnIndex)*this.sizeOfEachGrid[0])-this.sizeOfEachGrid[0]/2;

    var yRange1 = (rowIndex*this.sizeOfEachGrid[1]+(this.sizeOfEachGrid[1]/2));
    var yRange2 = ((this.options.dimensions[1]-rowIndex)*this.sizeOfEachGrid[1])-this.sizeOfEachGrid[1]/2;

    var draggable = new Draggable({
        snapX: this.sizeOfEachGrid[0], 
        snapY: this.sizeOfEachGrid[1], 
        xRange: [-xRange1, xRange2],
        yRange: [-yRange1, yRange2]
    });

    return draggable;
};

var _createAndBindEventsToDraggable = function(i) {

    var draggable = _createDraggableFor.call(this, i);

    var gridBoxes = this;
    var currentForNext;
    var hasTurnedFrom;

    (function(i) {
        var flippedIndexes = [];
        var crossed = false;
        currentForNext = i;

        draggable.on('start', function(evt) {

        });

        draggable.on('end', function(evt) {
            var endingAt = getElementForPositionOf.call(gridBoxes, i);

            if(gridBoxes.visitedGrid.indexOf(endingAt)==-1 && i!==endingAt && !crossed) {
                if(checkForElementInAssignedGrid.call(gridBoxes, gridBoxes.assignedGrids, endingAt)) {
                    
                    //hide front panel of moved element
                    gridBoxes.flippers[i].frontPanel.frontSurface.hide();
                    gridBoxes.flippers[endingAt].flipper.setFront(gridBoxes.flippers[endingAt].frontPanel.frontSurface);
                    
                    gridBoxes.draggables.forEach(function(draggable, index) {
                        if(index!==endingAt) {
                            draggable.deactivate(); 
                        } else {
                            draggable.activate();
                        }
                        
                    });

                    //if current element is not in visited grid, push
                    if(gridBoxes.visitedGrid.indexOf(i)==-1) {
                        gridBoxes.visitedGrid.push(i);
                    }
                    gridBoxes.visitedGrid.push(endingAt);
                
                    flippedIndexes.forEach(function(index) {
                        gridBoxes.flippedGrids.push(index);
                    });
                    
                    //check for last
                    if(gridBoxes.visitedGrid.length===(gridBoxes.assignedGrids.length)) {
                        GameSounds().playSound(1);
                        //hide front panel of last element
                        gridBoxes.flippers[endingAt].frontPanel.frontSurface.hide();
                        var getScore = gridBoxes.scoreCalculator.getScore(gridBoxes.flippedGrids.length, gridBoxes.options.dimensions, gridBoxes.assignedGrids.length);
                        _createScorePanel.call(gridBoxes, getScore);
                    }

                    //show orange blocks for other grids which cannot be moved
                    gridBoxes.assignedGrids.forEach(function(gridIndex) {
                        if(gridBoxes.visitedGrid.indexOf(gridIndex)==-1 && gridIndex!==endingAt) {
                            gridBoxes.flippers[gridIndex].flipper.setFront(gridBoxes.flippers[gridIndex].frontPanel.backSurface);
                        }
                    });


                    //play sound on successful ending
                    GameSounds().playSound(2);

                } else {
                    gridBoxes.draggables[i].setPosition([0, 0, 0], GridMesh.DEFAULTS.transition);
                    flippedIndexes.forEach(function(index) {
                        if(gridBoxes.flippers[index]) {
                            gridBoxes.flippers[index].flipper.setAngle(0, {curve : 'easeOutBounce', duration : 300});

                            //play sound for each flip on unsuccessful ending
                            GameSounds().playSound(4);
                        }
                    });  
                }
            } else {
                gridBoxes.draggables[i].setPosition([0, 0, 0], GridMesh.DEFAULTS.transition);
                flippedIndexes.forEach(function(index) {
                    if(gridBoxes.flippers[index]) {
                        gridBoxes.flippers[index].flipper.setAngle(0, {curve : 'easeOutBounce', duration : 300});
                        
                        //play sound for each flip on unsuccessful ending
                        GameSounds().playSound(4);
                    }
                });    
            }   
            
            flippedIndexes = [];
            crossed = false;
        });


        draggable.on('update', function(evt) {

            var elementIndex = getElementForPositionOf.call(gridBoxes, i);
            
            if(currentForNext!==elementIndex && !crossed) {
                if(gridBoxes.flippedGrids.indexOf(elementIndex)==-1 && flippedIndexes.indexOf(elementIndex)==-1) {
                    var hasTurnedTo = _turnedTo.call(gridBoxes, currentForNext, elementIndex);

                    var isUnassignedElement = !checkForElementInAssignedGrid(gridBoxes.assignedGrids, elementIndex);

                    if(isUnassignedElement) {
                        if(flippedIndexes.indexOf(elementIndex)==-1) {
                            flippedIndexes.push(elementIndex);
                        }
                        if(gridBoxes.flippers[elementIndex]) {
                            gridBoxes.flippers[elementIndex].flipper.setAngle(Math.PI, {curve : 'easeOutBounce', duration : 300});  
                        }         
                    }

                    if(gridBoxes.flippers[elementIndex]) {
                        _constructLines.call(gridBoxes, hasTurnedTo, hasTurnedFrom, elementIndex, currentForNext); 
                        
                        //play sound for each construction of line
                        GameSounds().playSound(4);
                    }

                    //assign for next
                    currentForNext = elementIndex;
                    hasTurnedFrom = hasTurnedTo;
                } else {
                    crossed = true;
                }
            } 
        });

    }(i));

    return draggable;
};

var _createGridBoxes = function() {

    this.draggables = [];
    this.gridBoxModifiers = [];

    this.flippers = [];

    this.flippersBackModifiers = [];
    var gridLayout = new GridLayout({
        dimensions : this.options.dimensions
    });

    var surfaces = [];
    gridLayout.sequenceFrom(surfaces);

    var noOfGrids = this.options.dimensions[0]*this.options.dimensions[1];

    for(var i = 0; i < noOfGrids; i++) {
        var surfaceNode = new RenderNode();

        var tempModifier = new StateModifier({
            origin : [0.5, 0.5],
            align : [0.5, 0.5],
            size : this.sizeOfEachGrid
        });

        this.gridBoxModifiers.push(tempModifier);

        this.lineSize = 8;

        var FlipperContainer = _createFlipperContainer.call(this, i);
        this.flippers.push(FlipperContainer);

        if(this.assignedGrids.indexOf(i)!==-1) {

            var draggable = _createAndBindEventsToDraggable.call(this, i);

            draggable.subscribe(FlipperContainer.frontPanel.frontSurface.surface);
            this.draggables[i] = draggable;

            surfaceNode.add(tempModifier).add(draggable).add(FlipperContainer.flipper);

        } else {
            surfaceNode.add(tempModifier).add(FlipperContainer.flipper);
        }
        surfaces.push(surfaceNode);
    }

    var gridModifier = new Modifier({
        size: [this.options.dimensions[0]*this.sizeOfEachGrid[0], this.options.dimensions[1]*this.sizeOfEachGrid[1]],
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });

    var renderNode = new RenderNode({
        properties :{
            borderRadius: '20px'
        }
    });
    renderNode.add(gridModifier).add(gridLayout);
    this.gridMeshBoxes = renderNode;
};

var _createScorePanel = function(score) {
    if(this.scorePanel) {
        this.scorePanel.hide();
    }
    var scorePanel = new ScorePanel({
        score : score
    });
    this.scorePanel = scorePanel;
    this.scorePanel.show();
    this.add(this.scorePanel);


    //on close of score panel
    var gridMesh = this;

    this.scorePanel.on('scoreclosed', function(score) {

        //save game data into local storage
        var gameData = JSON.parse(localStorage.getItem("gameData"));
        if(!gameData) {
            gameData = {
                levelData : {}
            };
        }
        
        if(!gameData.levelData[gridMesh.options.level]) {
            gameData.levelData[gridMesh.options.level] = [];
        }
        gameData.levelData[gridMesh.options.level].push({ score : score, date : new Date() });
        localStorage.setItem("gameData", JSON.stringify(gameData));


        //emit closed event
        gridMesh.eventOutput.emit('scoreclosed');
    })
}

var _create = function() {
    var gridMeshAssigner = new GridMeshAssigner();

    this.assignedGrids = gridMeshAssigner.getGridIndexex(this.options.level, this.options.dimensions);
    this.visitedGrid = [];
    this.flippedGrids = [];

    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.scoreCalculator = new ScoreCalculator();

    _createGrid.call(this);
    _createHighlightedGrid.call(this);
    _createGridBoxes.call(this);
};

var _init = function() {
    this.add(this.gridMeshDabba);
    this.add(this.gridMesh);
    this.add(this.gridMeshBoxes);
};

GridMesh.prototype.show = function() {
    this.visible = true;
};

GridMesh.prototype.hide = function() {
    this.visible = false;
};

GridMesh.prototype.render = function render() {
    return this.visible ? this._node.render() : undefined;
}

module.exports = GridMesh;
});