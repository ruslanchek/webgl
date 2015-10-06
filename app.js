var startedSecond = new Date().getSeconds();
var totalPointsFromStart = 90 + startedSecond % 10;

var ChartArea = function(sceneSelector) {
	var _this = this,
		gradient = null,
		areaPolygon = null,
		line = null,
		animationDuration = 900,
		sceneHeight = 0,
		animationEnabled = false,
		sceneWidth = 0,
		scene = null,
		globalPoints = [],
		$sceneContainer = getContainerObj(),
		marginTop = 50,
		marginBottom = 50,
		marginLeft = 0,
		marginRight = 100,
		gridGroup = null,
		gridLevelGroup = null,
		gridLines = [],
		gridLevelLines = [],
		expirationSeconds = 10,
		currentLevelLine = null,
		currentLevelCircleGroup = null,
		cutOldPoints = false,
		start = 0,
		counter = startedSecond % expirationSeconds,
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
			gridGroup = createGridGroup();
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

	function createGridGroup() {
		return scene.group();
	}

	function addZero(i) {
		if(i < 10) {
			i = "0" + i;
		}

		return i;
	}

	function humanizeTime(time) {
		return addZero(time.getHours()) + ':' +
			addZero(time.getMinutes()) + ':' +
			addZero(time.getSeconds());
	}

	function getCurrentLevel() {
		return globalPoints[globalPoints.length - 1];
	}

	function drawCurrentLevel() {
		var currentLevel = getCurrentLevel(),
			time = currentLevel[0],
			level = currentLevel[1],
			y = levelToY(level) - 0.5,
			x = timeToX(time),
			circleInnerRadius = 5,
			circleOuterRadius = 10,
			circleDotRadius = 2;

		if(!currentLevelLine) {
			currentLevelLine = scene.line(0, 0, sceneWidth, 0).stroke({
				width: 1,
				color: '#4186BA'
			});

			currentLevelLine.transform({
				y: y
			});

			currentLevelCircleGroup = scene.group();

			currentLevelCircleGroup.transform({
				x: x,
				y: y
			});

			var circleOuter = scene.circle(circleOuterRadius * 2).fill({
				color: 'RGBA(247, 252, 255, 1)'
			}).opacity(0.1);

			circleOuter.transform({
				x: -circleOuterRadius,
				y: -circleOuterRadius
			});

			var circleInner = scene.circle(circleInnerRadius * 2).fill({
				color: '#F7FCFF'
			});

			circleInner.transform({
				x: -circleInnerRadius,
				y: -circleInnerRadius
			});

			var circleDot = scene.circle(circleDotRadius * 2).fill({
				color: '#528FCC'
			});

			circleDot.transform({
				x: -circleDotRadius,
				y: -circleDotRadius
			});

			currentLevelCircleGroup.add(circleOuter);
			currentLevelCircleGroup.add(circleInner);
			currentLevelCircleGroup.add(circleDot);
		} else {
			currentLevelLine.animate(getAnimationDuration()).transform({
				y: y,
			});

			currentLevelCircleGroup.animate(getAnimationDuration()).transform({
				x: x,
				y: y
			});

			currentLevelCircleGroup.children()[0]
				.animate(getAnimationDuration() / 4)
				.opacity(0.2)
				.radius(circleOuterRadius * 1.4);

			setTimeout(function() {
				currentLevelCircleGroup.children()[0]
					.animate(getAnimationDuration() / 2)
					.opacity(0.1)
					.radius(circleOuterRadius);
			}, getAnimationDuration() / 4);
		}
	}

	function drawLevels() {
		if(gridLevelLines.length === 0) {
			_.times(5, function(i) {
				var y = sceneHeight / 5 * i + 0.5;
				var x = sceneWidth - 80;

				var line = scene.line(0, y, x, y).stroke({
					width: 1,
					color: 'RGBA(194, 205, 209, .1)'
				});

				var level = yToLevel(y).toFixed(6);
				var text = scene.text(level)
					.move(x + 10, y - 4.5)
					.font({
						family: 'Roboto',
						weight: 100,
						size: 12,
						anchor: 'left'
					})
					.fill({
						color: 'RGBA(194, 205, 209, .8)'
					});

				gridLevelLines.push({
					line: line,
					text: text
				});
			});
		} else {
			_.each(gridLevelLines, function(line, i) {
				var y = sceneHeight / 5 * i + 0.5;
				var x = sceneWidth - 80;
				var level = yToLevel(y).toFixed(6);

				line.text.text(level);
			});
		}
	}

	function drawGrid(points) {
		var time = 0;
		var timeStep = 30;

		var dt = new Date();
		var dts = dt.setSeconds(dt.getSeconds() - totalPointsFromStart);

		if(gridLines.length === 0) {
			_.times(30, function() {
				var x = timeToX(time) + 0.5;

				var line = scene.line(x, 0, x, sceneHeight - 25).stroke({
					width: 1,
					color: 'RGBA(194, 205, 209, .1)'
				});

				var timeMarker = humanizeTime(new Date(dts + time * 1000));

				var text = scene.text(timeMarker)
					.move(x, sceneHeight - 17)
					.font({
						family: 'Roboto',
						weight: 100,
						size: 12,
						anchor: 'middle'
					})
					.fill({
						color: 'RGBA(194, 205, 209, .8)'
					});

				gridLines.push({
					line: line,
					text: text,
					x: x,
					time: time
				});

				time += timeStep;
			});
		} else {
			_.each(gridLines, function(line) {
				var x = timeToX(0);

				line.line.animate(getAnimationDuration()).transform({
					x: x
				});

				line.text.animate(getAnimationDuration()).transform({
					x: x
				});
			});
		}
	}

	var griddr = false;

	function draw(animate) {
		calculateDimensions(globalPoints);

		animationEnabled = animate;

		drawGrid();
		drawLevels();
		drawCurrentLevel();

		if(scene && globalPoints && globalPoints.length > 0) {
			updateSceneDimensions();

			var convertedPoints = convertPoints(globalPoints);

			drawLine(convertedPoints);
			drawAreaPolygon(convertedPoints);

			if(cutOldPoints) {
				setTimeout(function() {
					if(globalPoints.length > 90){
						globalPoints = globalPoints.splice(globalPoints.length - 90, globalPoints.length - 1);

						calculateDimensions(globalPoints);

						animationEnabled = false;
						cutOldPoints = false;

						var convertedPoints = convertPoints(globalPoints);

						start = 0;

						drawLine(convertedPoints);
						drawAreaPolygon(convertedPoints);
					}
				}, animationDuration);
			}
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

		return(widthPercent * timePercent) + marginLeft;
	}

	function levelToY(level) {
		var levelPercent = (level - dataDimensions.minY) / dataDimensions.rangePercentY,
			heightPercent = (sceneHeight - marginBottom - marginTop) / 100;

		return sceneHeight - (heightPercent * levelPercent) - marginBottom;
	}

	var pointsLength = 0;

	function calculateDimensions(points) {
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

		if(pointsLength === 0) {
			pointsLength = points.length;
		} else {
			pointsLength++;
		}

		counter++;

		if(counter == expirationSeconds) {
			cutOldPoints = true;
			start += counter;
			counter = 0;
		}

		_.each(points, function(point, i) {
			if(i >= start) {
				if(point[1] > maxY) {
					maxY = point[1];
				}
			}
		});

		_.each(points, function(point, i) {
			if(i >= start) {
				if(point[1] < maxY && point[1] < minY) {
					minY = point[1];
				}
			}
		});

		minX = start;
		maxX = 150 + start;

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

var getY = function() {
	var r = _.random(0, 1);

	var arr = [
		_.random(_.random(_.random(0.121212, 0.121312), _.random(0.121312, 0.121332)), _.random(_.random(0.121334, 0.121354), _.random(0.121354, 0.121554)))
	];

	return arr[0];
};

_.times(totalPointsFromStart, function() {
	chartArea.addPoints([
		x,
		getY()
	]);

	x += 1;
});

chartArea.draw(false);

setInterval(function() {
	x += 1;

	chartArea.addPoints([
		x,
		getY()
	]);

	chartArea.draw(true);
}, 1000);
