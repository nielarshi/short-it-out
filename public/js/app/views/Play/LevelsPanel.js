define(function(require, exports, module) {
    var View = require("famous/core/View");
    var Surface = require("famous/core/Surface");
    var Modifier = require("famous/core/Modifier");
    var StateModifier = require("famous/modifiers/StateModifier");
    var Transform = require("famous/core/Transform");
    var RenderNode = require("famous/core/RenderNode");
    var GridLayout = require("famous/views/GridLayout");
    var Flipper = require("famous/views/Flipper");
    var EventHandler = require("famous/core/EventHandler");

    var LevelPanel = require("app/views/Play/IndividualLevelPanel");
    var Levels = require("app/views/Play/Levels");

    var GameSounds = require("app/audio/GameSounds");

    var LevelsPanel = function() {
        View.apply(this, arguments);

        _create.call(this);
        _init.call(this);
    };

    LevelsPanel.prototype = Object.create(View.prototype);
    LevelsPanel.prototype.constructor = LevelsPanel;

    LevelsPanel.DEFAULTS = {
        visible : true
    };

    var _createLevels = function() {
        var levelsPanel = this;
        this.levels = new Levels({
            size : this.options.size
        });
        this.levels.on('levelopened', function(index) {
            //play sound on open
            GameSounds().playSound(4);

            levelsPanel.levels.hide();
            _openLevelPanel.call(levelsPanel, index);
        });
    }

    var _create = function() {
        this.visible = LevelsPanel.DEFAULTS.visible;
        _createLevels.call(this);
    };

    var _init = function() {
        this.add(this.levels);
    };

    var _openLevelPanel = function(i) {
        var levelPanel = new LevelPanel({
            level : (i+1),
            classes : ['level-panel'],
            size : this.options.size
        });
        levelPanel.show();
        this.add(levelPanel);

        var levelsPanel = this;
        levelPanel.on('levelreload', function(levelIndex) {
            
            //attach audio on selecting option
            GameSounds().playSound(0);
            this.hide();
            _openLevelPanel.call(levelsPanel, levelIndex);
        });

        levelPanel.on('levelclosed', function(level) {

            //play sound on close
            GameSounds().playSound(4);

            levelPanel.hide();
            _createLevels.call(levelsPanel);
            _init.call(levelsPanel);
        }) 
    };

    LevelsPanel.prototype.hide = function() {
        this.visible = false;
    };

    LevelsPanel.prototype.show = function() {
        this.visible = true;
    };

    LevelsPanel.prototype.render = function render() {
        return this.visible ? this._node.render() : undefined;
    };


    module.exports = LevelsPanel;
});