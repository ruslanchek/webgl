var startedSecond = new Date().getSeconds();
var totalPointsFromStart = 90 + startedSecond % 30;

var ChartArea = function (sceneSelector) {
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
        multiplier = 1,
        marginLeft = 0,
        marginRight = 100,
        gridGroup = null,
        expirationLineGroup = null,
        gridLines = [],
        gridLevelLines = [],
        expirationSeconds = 30,
        currentLevelLine = null,
        currentLevelCircleGroup = null,
        cutOldPoints = false,
        currentPoint = null,
        expIteration = 1,
        start = 0,
        bets = [],
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
        if (!scene) {
            scene = createScene();
            resizeScene();
            updateSceneDimensions();
            gradient = createAreaGradient();
            areaPolygon = createAreaPolygon();
            line = createLine();
            gridGroup = createGridGroup();

            SVG.on(window, 'resize', function () {
                scene.spof();
            });
        }
    }

    function updateSceneDimensions() {
        sceneWidth = parseFloat(scene.node.clientWidth);
        sceneHeight = parseFloat(scene.node.clientHeight);
    }

    function createAreaGradient() {
        var gradient = scene.gradient('linear', function (stop) {
            stop.at({
                offset: 0,
                color: '#1594D1',
                opacity: 0.4
            });

            stop.at({
                offset: 1,
                color: '#1594D1',
                opacity: 0.0
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
        return (animationEnabled) ? animationDuration : 0;
    }

    function convertPoints(points) {
        var newPoints = [];

        _.each(points, function (point) {
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
        if (i < 10) {
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

    function drawBets() {
        _.each(bets, function (bet) {
            var x = timeToX(bet.time);
            var y = levelToY(bet.level) + 0.5;

            if (!bet.drawGroup) {
                var color = (bet.type === 1) ? '#45C672' : '#EC4D4E';

                bet.drawGroup = scene.group();

                var betLine = scene.line(0, 0, sceneWidth - 80, 0).stroke({
                    width: 1,
                    color: color
                });

                bet.drawGroup.add(betLine);

                bet.drawGroup.transform({
                    y: y
                });

                bet.drawArrowGroup = scene.group();

                var betCircle = scene.circle(10).fill({
                    color: '#272C33'
                }).stroke({
                    width: 3,
                    color: color
                });

                betCircle.transform({
                    x: -5,
                    y: -5
                });

                var arrowPoints = [];

                if(bet.type === 1){
                    arrowPoints = [
                        [-6, -2],
                        [0, -12],
                        [6, -2],
                        [-6, -2]
                    ];
                }else{
                    arrowPoints = [
                        [-6, 2],
                        [0, 12],
                        [6, 2],
                        [-6, 2]
                    ];
                }

                var betTriangle = scene.polygon(arrowPoints).fill({
                    color: color
                });

                bet.drawArrowGroup.add(betTriangle);
                bet.drawArrowGroup.add(betCircle);
                bet.drawArrowGroup.transform({
                    y: y,
                    x: x
                });
            } else {
                bet.drawGroup.animate(getAnimationDuration()).transform({
                    y: y
                });

                bet.drawArrowGroup.animate(getAnimationDuration()).transform({
                    y: y,
                    x: x
                });
            }
        });
    }

    function drawExpiration() {
        var purchaseX = timeToX(start + 120) + 0.5;

        if (!expirationLineGroup) {
            expirationLineGroup = scene.group();

            var intervalRange = timeToX(30);

            var expLine = scene.line(intervalRange, 0, intervalRange, sceneHeight - 25).stroke({
                width: 1,
                color: '#D5D33D'
            });

            var purchaseTime = scene.line(0, 0, 0, sceneHeight - 25).stroke({
                width: 1,
                color: '#9AA6AC'
            });

            var expText = scene.text('Время экспирации')
                .move(0, 0)
                .font({
                    family: 'Roboto',
                    weight: 100,
                    size: 10,
                    'text-anchor': 'end'
                })
                .fill({
                    color: '#D5D33D'
                });

            var purchaseText = scene.text('Время покупки')
                .move(0, 0)
                .font({
                    family: 'Roboto',
                    weight: 100,
                    size: 10,
                    'text-anchor': 'end'
                })
                .fill({
                    color: '#9AA6AC'
                });

            expText.rotate(-90).transform({
                x: intervalRange - 14,
                y: 4
            });

            purchaseText.rotate(-90).transform({
                x: -14,
                y: 4
            });

            expirationLineGroup.add(expLine);
            expirationLineGroup.add(purchaseTime);
            expirationLineGroup.add(expText);
            expirationLineGroup.add(purchaseText);

            expirationLineGroup.transform({
                x: purchaseX
            });
        } else {
            expirationLineGroup.transform({
                x: purchaseX
            });

            setTimeout(function () {
                expirationLineGroup.animate(getAnimationDuration()).transform({
                    x: purchaseX
                });
            }, 0);
        }
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

        if (!currentLevelLine) {
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
                y: y
            });

            currentLevelCircleGroup.animate(getAnimationDuration()).transform({
                x: x,
                y: y
            });

            currentLevelCircleGroup.children()[0]
                .animate(getAnimationDuration() / 4)
                .opacity(0.2)
                .radius(circleOuterRadius * 1.4);

            setTimeout(function () {
                currentLevelCircleGroup.children()[0]
                    .animate(getAnimationDuration() / 2)
                    .opacity(0.1)
                    .radius(circleOuterRadius);
            }, getAnimationDuration() / 4);
        }
    }

    function drawLevels() {
        if (gridLevelLines.length === 0) {
            _.times(5, function (i) {
                var y = sceneHeight / 5 * i + 0.5;
                var x = sceneWidth - 80;

                var line = scene.line(0, y, x, y).stroke({
                    width: 1,
                    color: 'RGBA(194, 205, 209, .1)'
                });

                var level = yToLevel(y).toFixed(6);
                var text = scene.text(level)
                    .move(x + 6, y - 2.5)
                    .font({
                        family: 'Roboto',
                        weight: 100,
                        size: 10,
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
            _.each(gridLevelLines, function (line, i) {
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

        if (gridLines.length === 0) {
            _.times(50, function (i) {
                var x = timeToX(time) - 0.5;

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
                        size: 10,
                        anchor: 'middle'
                    })
                    .fill({
                        color: 'RGBA(194, 205, 209, .8)'
                    });

                if(i > 4 + expIteration){
                    line.opacity(0);
                    text.opacity(0);
                }

                gridLines.push({
                    line: line,
                    text: text,
                    x: x,
                    time: time
                });

                time += timeStep;
            });
        } else {
            _.each(gridLines, function (line, i) {
                var x = timeToX(0);

                if(i + 1 < expIteration){
                    setTimeout(function(){
                        line.line.remove();
                        line.text.remove();
                    }, getAnimationDuration());
                }else{
                    line.line.animate(getAnimationDuration()).transform({
                        x: x
                    });

                    line.text.animate(getAnimationDuration()).transform({
                        x: x
                    });
                }

                if(i >= 3 + expIteration && i <= 4 + expIteration){
                    line.line.opacity(1);
                    line.text.opacity(1);
                }
            });
        }
    }

    function draw(animate) {
        calculateDimensions(globalPoints);

        animationEnabled = animate;

        drawGrid();
        drawLevels();
        drawCurrentLevel();
        drawExpiration();
        drawBets();

        if (scene && globalPoints && globalPoints.length > 0) {
            updateSceneDimensions();

            var convertedPoints = convertPoints(globalPoints);

            drawLine(convertedPoints);
            drawAreaPolygon(convertedPoints);

            //if(cutOldPoints) {
            //	setTimeout(function() {
            //		if(globalPoints.length > 90){
            //			globalPoints = globalPoints.splice(globalPoints.length - 90, globalPoints.length - 1);
            //
            //			calculateDimensions(globalPoints);
            //
            //			animationEnabled = false;
            //			cutOldPoints = false;
            //
            //			var convertedPoints = convertPoints(globalPoints);
            //
            //			drawLine(convertedPoints);
            //			drawAreaPolygon(convertedPoints);
            //		}
            //	}, animationDuration);
            //}
        }
    }

    function getSceneDimensions() {
        return {
            width: $sceneContainer.width(),
            height: $sceneContainer.height()
        };
    }

    function createScene() {
        if ($sceneContainer && $sceneContainer[0]) {
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
            widthPercent = (sceneWidth - marginRight - marginLeft) / 100,
            x = (widthPercent * timePercent) + marginLeft;

        return x;
    }

    function levelToY(level) {
        var levelPercent = (level - dataDimensions.minY) / dataDimensions.rangePercentY,
            heightPercent = (sceneHeight - marginBottom - marginTop) / 100;

        return sceneHeight - (heightPercent * levelPercent) - marginBottom;
    }

    function betClear() {
        var currentLevel = currentPoint[1];

        _.each(bets, function (bet) {
            if (bet.type === 1) { // Call
                if (currentLevel > bet.level) {
                    bet.win = 1;
                } else if (currentLevel < bet.level) {
                    bet.win = 0;
                }
            } else { // Put
                if (currentLevel < bet.level) {
                    bet.win = 1;
                } else if (currentLevel > bet.level) {
                    bet.win = 0;
                }
            }

            if (currentLevel == bet.level) {
                bet.win = 2;
            }

            bet.drawGroup.remove();
            bet.drawArrowGroup.remove();
        });

        console.log('bets closed', bets);

        bets = [];
    }

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

        currentPoint = points[points.length - 1];

        if (bets.length > 0) {
            multiplier = 2;
        } else {
            multiplier = 1;
        }

        if (counter == expirationSeconds * multiplier) {
            cutOldPoints = true;
            start += counter;
            counter = 0;
            expIteration++;

            if (multiplier > 1) {
                betClear();
            }
        }

        counter++;

        _.each(points, function (point, i) {
            if (i >= start) {
                if (point[1] > maxY) {
                    maxY = point[1];
                }
            }
        });

        _.each(points, function (point, i) {
            if (i >= start) {
                if (point[1] < maxY && point[1] < minY) {
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

    function setBet(type, amount) {
        var level = currentPoint[1];

        if (level < 120 && bets.length < 5) {
            var bet = {
                drawGroup: null,
                amount: amount,
                time: currentPoint[0],
                level: level,
                type: 0,
                win: -1
            };

            if (!currentPoint) {
                return;
            }

            if (type === 1) { // Call
                bet.type = 1;
            }

            bets.push(bet);
        } else {
            console.log('cant set a bet');
        }
    }

    function resizeScene() {
        if (scene) {
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
    _this.setBet = setBet;
    _this.resizeScene = resizeScene;

    init();
};

var chartArea = new ChartArea('#scene');


var x = 0;

var getY = function () {
    var arr = [
        _.random(
            _.random(
                _.random(0.121212, 0.121312),
                _.random(0.121312, 0.121332)
            ),
            _.random(
                _.random(0.121334, 0.121354),
                _.random(0.121354, 0.121554)
            )
        )
    ];

    return arr[0];
};

_.times(totalPointsFromStart + 1, function () {
    chartArea.addPoints([
        x,
        getY()
    ]);

    x += 1;
});

chartArea.draw(false);

setInterval(function () {
    chartArea.addPoints([
        x,
        getY()
    ]);

    x += 1;

    chartArea.draw(true);
}, 1000);


//setTimeout(function () {
//    chartArea.setBet(1, 20);
//}, 4000);
//
//setTimeout(function () {
//    chartArea.setBet(0, 10);
//}, 5000);
//
//setTimeout(function () {
//    chartArea.setBet(1, 100);
//}, 6000);
//
//setTimeout(function () {
//    chartArea.setBet(0, 50);
//}, 8000);
