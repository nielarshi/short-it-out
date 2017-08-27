define(function(require, exports, module) {

  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Modifier = require("famous/core/Modifier");
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');
  var GridLayout = require("famous/views/GridLayout");
  var SequentialLayout = require("famous/views/SequentialLayout");
  var RenderNode = require("famous/core/RenderNode");


  var getDate = function(date) {

      var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var date = new Date(date);
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return (day+"-"+monthNames[monthIndex]+"-"+year);
  };

  function LevelRow() {
            View.apply(this, arguments);

            var levelModifier = new Modifier({
                origin : [0, 0],
                align : [0, 0]
            });
            var levelSurface = new Surface({
                size : [undefined, true],
                content : "<div>Level "+this.options.level+"</div>",
                properties : {
                    color : "white",
                    padding : '0.2em',
                    fontSize : '0.8em',
                    background : '#16A085',
                    textAlign : 'left',
                    borderRadius : '5px'
                }
            });

            var renderNode = new RenderNode();
            renderNode.add(levelModifier).add(levelSurface);

            var scoresForLevel = this.options.scores;
            var scoreSurfaces = [];

            var scoreGrid = new SequentialLayout();
            scoreGrid.sequenceFrom(scoreSurfaces);
            scoreSurfaces.push(renderNode);

            var level = this;
            scoresForLevel.forEach(function(scoreData) {
                var scoreModifier = new Modifier({
                    origin : [0, 0],
                    align : [0, 0]
                });

                var scoreSurface = new Surface({
                    size : [undefined, true],
                    content : "<div><span class='date'>"+getDate(scoreData.date)+"</span><span class='score'>"+scoreData.score+"</span></div>",
                    properties : {
                        padding : '0.3em',
                        fontSize : '0.5em',
                        background : '#ECF0F1',
                        textAlign : 'right',
                        paddingRight : '1em',
                        borderRadius : '5px'
                    }
                });

                var renderSurfaceNode = new RenderNode();
                renderSurfaceNode.add(scoreModifier).add(scoreSurface);

                scoreSurface.pipe(level._eventOutput);
                scoreSurfaces.push(renderSurfaceNode);
            });

            levelSurface.pipe(this._eventOutput);
            this.add(scoreGrid);
  }

  LevelRow.prototype = Object.create(View.prototype);
  LevelRow.prototype.constructor = LevelRow;

  LevelRow.DEFAULTS = {
       
  };

  module.exports = LevelRow; 
});