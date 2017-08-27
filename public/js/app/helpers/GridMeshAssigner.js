define(function(require, exports, module) {
	var GridAssigner = function() {

	};

	function randomIntFromInterval(min,max) {
    	return Math.floor(Math.random()*(max-min+1)+min);
	}

	GridAssigner.prototype.getGridIndexex = function(level, dimensions) {

		var max = dimensions[0] * dimensions[1];

		var limit = randomIntFromInterval(5, max/2);

		var grids = [];
		for(var i = 1; i < limit; i++) {
			var number = randomIntFromInterval(0,max);
			if(grids.indexOf(number)===-1) {
				grids.push(number);
			}
		}
		return grids;
	};

	module.exports = GridAssigner;
});