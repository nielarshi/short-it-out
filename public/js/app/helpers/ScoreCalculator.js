define(function(require, exports, module) {
	var ScoreCalculator = function() {

	};

	ScoreCalculator.prototype.getScore = function(length, dimensions, assignedBlockCount) {
		var score = (((dimensions[0] * dimensions[1]) - length) * dimensions[0] * dimensions[1]) / assignedBlockCount;
		return Math.ceil(score);
	};
	
	module.exports = ScoreCalculator;
});