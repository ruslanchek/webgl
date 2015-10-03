var ChartArea = function(sceneSelector) {
	var _this = this,
		gradient = null,
		areaPolygon = null,
		line = null,
		animationDuration = 300,
		sceneHeight = 0,
		animationEnabled = false,
		sceneWidth = 0,
		scene = null,
		globalPoints = [],
		$sceneContainer = getContainerObj(),
		marginTop = 100,
		marginBottom = 100,
		marginLeft = 0,
		marginRight = 200,
		dataDimensions = {
			maxX: 0,
			maxY: 0,
			minX: 0,
			minY: 0,
			rangeX: 0,
			rangeY: 0,
			rangePercentX: 0,
			rangePercentY: 0
		};

	function init() {
		if(!scene) {
			scene = createScene();
			resizeScene();
			updateSceneDimensions();
			gradient = createAreaGradient();
			areaPolygon = createAreaPolygon();
			line = createLine();
		}
	}

	function updateSceneDimensions() {
		sceneWidth = parseFloat(scene.node.clientWidth);
		sceneHeight = parseFloat(scene.node.clientHeight);
	}

	function createAreaGradient() {
		var gradient = scene.gradient('linear', function(stop) {
			stop.at({
				offset: 0,
				color: '#1594D1',
				opacity: 0.3
			});

			stop.at({
				offset: 1,
				color: '#1594D1',
				opacity: 0.075
			});
		});

		gradient.from(0, 0).to(0, 1);

		return gradient;
	}

	function getAreaConnectedPoints(points) {
		return _.union([
			[points[points.length - 1][0], sceneHeight]
		], [
			[points[0][0], sceneHeight]
		], points);
	}

	function createAreaPolygon() {
		return scene.polygon().fill({
			color: gradient
		});
	}

	function createLine() {
		return scene.polyline().fill('none').stroke({
			width: 2,
			color: '#1595D3'
		});
	}

	function drawLine(points) {
		line
			.animate(getAnimationDuration())
			.plot(points);
	}

	function drawAreaPolygon(points) {
		areaPolygon
			.animate(getAnimationDuration())
			.plot(getAreaConnectedPoints(points));
	}

	function getAnimationDuration() {
		return(animationEnabled) ? animationDuration : 0;
	}

	function convertPoints(points) {
		var newPoints = [];

		_.each(points, function(point) {
			newPoints.push([
				timeToX(point[0]),
				levelToY(point[1])
			]);
		});

		return newPoints;
	}

	function draw(animate) {
		animationEnabled = animate;

		if(scene && globalPoints && globalPoints.length > 0) {
			updateSceneDimensions();

			var convertedPoints = convertPoints(globalPoints);

			drawLine(convertedPoints);
			drawAreaPolygon(convertedPoints);
		}
	}

	function getSceneDimensions() {
		return {
			width: $sceneContainer.width(),
			height: $sceneContainer.height()
		};
	}

	function createScene() {
		if($sceneContainer && $sceneContainer[0]) {
			var dimensions = getSceneDimensions();

			return SVG($sceneContainer[0])
				.size(dimensions.width, dimensions.height);
		}
	}

	function xToTime(x) {
		var percent = x / (sceneWidth / 100),
			time = dataDimensions.minX + (percent * dataDimensions.rangePercentX);


		return time;
	}

	function yToLevel(y) {
		var percent = (sceneHeight - y) / (sceneHeight / 100),
			level = dataDimensions.minY + (percent * dataDimensions.rangePercentY);

		return level;
	}

	function timeToX(time) {
		var timePercent = (time - dataDimensions.minX) / dataDimensions.rangePercentX,
			widthPercent = (sceneWidth - marginRight - marginLeft) / 100;

		return (widthPercent * timePercent) + marginLeft;
	}

	function levelToY(level) {
		var levelPercent = (level - dataDimensions.minY) / dataDimensions.rangePercentY,
			heightPercent = (sceneHeight - marginBottom - marginTop) / 100;

		return sceneHeight - (heightPercent * levelPercent) - marginBottom;
	}

	function calculateDimensions(points){
		var maxX = 0,
			maxY = 0,
			minX = Infinity,
			minY = Infinity,
			rangeX = 0,
			rangeY = 0,
			precentX = 0,
			precentY = 0,
			rangePercentX = 0,
			rangePercentY = 0;

		_.each(points, function(point){
			if(point[0] > maxX){
				maxX = point[0];
			}

			if(point[1] > maxY){
				maxY = point[1];
			}
		});

		_.each(points, function(point){
			if(point[0] < maxX && point[0] < minX){
				minX = point[0];
			}

			if(point[1] < maxY && point[1] < minY){
				minY = point[1];
			}
		});

		rangeX = maxX - minX;
		rangeY = maxY - minY;

		rangePercentX = rangeX / 100;
		rangePercentY = rangeY / 100;

		dataDimensions = {
			maxX: maxX,
			maxY: maxY,
			minX: minX,
			minY: minY,
			rangeX: rangeX,
			rangeY: rangeY,
			rangePercentX: rangePercentX,
			rangePercentY: rangePercentY
		};
	}

	function addPoints(points) {
		globalPoints = _.union(globalPoints, [points]);
		calculateDimensions(globalPoints);
	}

	function resizeScene() {
		if(scene) {
			var dimensions = getSceneDimensions();
			scene.size(dimensions.width, dimensions.height);
			updateSceneDimensions();
		}
	}

	function getContainerObj() {
		return $(sceneSelector);
	}

	_this.draw = draw;
	_this.addPoints = addPoints;
	_this.resizeScene = resizeScene;

	init();
};

var chartArea = new ChartArea('#scene');

$(window).on('resize', function() {
	chartArea.resizeScene();
});

var x = 0;

_.times(100, function() {
	x += 5;

	chartArea.addPoints([
		x,
		_.random(_.random(_.random(0, 1000), _.random(0, 1000)), _.random(_.random(0, 1000), _.random(0, 1000)))
	]);
});

chartArea.draw(false);

setInterval(function() {
	x += 5;

	chartArea.addPoints([
		x,
		_.random(_.random(_.random(0, 1000), _.random(0, 1000)), _.random(_.random(0, 1000), _.random(0, 1000)))
	]);

	chartArea.draw(true);
}, 1000);
