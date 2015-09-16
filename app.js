var ChartArea = function(scene) {
	var _this = this,
		gradient = null,
		areaPolygon = null,
		line = null,
		animationDuration = 300,
		sceneHeight = 0,
		animationEnabled = false,
		sceneWidth = 0;

	function init() {
		if(scene) {
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
		return _.union([[points[points.length - 1][0], sceneHeight]], [[points[0][0], sceneHeight]], points);
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
				point[0],
				sceneHeight - point[1]
			]);
		});

		return newPoints;
	}

	function draw(points, animate) {
		points = convertPoints(points);

		animationEnabled = animate;

		if(scene && points && points.length > 0) {
			updateSceneDimensions();
			drawLine(points);
			drawAreaPolygon(points);
		}
	}

	_this.draw = draw;

	init();
};

var scene = SVG('scene').size($(window).width(), $(window).height() / 2);
var scene1 = SVG('scene1').size($(window).width(), $(window).height() /2);
var chartArea = new ChartArea(scene);
var chartArea1 = new ChartArea(scene1);

var points = [
	[2, 100],
	[5, 104]
];

_.times(100, function(){
    points.push([
    	points[points.length - 1][0] + 5,
    	_.random(_.random(400, 450), _.random(450, 500))
    ]);
});

chartArea.draw(points, false);
chartArea1.draw(points, false);

setInterval(function() {
	points.push([
		points[points.length - 1][0] + 5,
		_.random(_.random(400, 450), _.random(450, 500))
	]);

	chartArea.draw(points, true);
	chartArea1.draw(points, true);
}, 1000);

$(window).on('resize', function() {
	scene.size($(window).width(), $(window).height());
	chartArea.draw(points, true);
	chartArea1.draw(points, true);
});
