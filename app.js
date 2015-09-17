var ChartLineMaterial = function(){

};

var ChartScene = function(containerId){
    var _this = this,
        renderer = null,
        $container = null,
        camera = null,
        renderType = undefined,
        scene = null;

    function init(){
        createRenderer();
        initContainer();
        resizeScene();
        createCamera();
        createScene();
        render();
    }

    function initContainer(){
        $container = $('#' + containerId);
        $container.append(renderer.domElement);
    }

	function isWebGLAvailable() {
		try {
			var canvas = document.createElement('canvas');

			return !!(window.WebGLRenderingContext && (
				canvas.getContext('webgl') ||
				canvas.getContext('experimental-webgl')));
		} catch(e) {
			return false;
		}
	}

    function createRenderer() {
        if (isWebGLAvailable()) {
            renderType = 'WebGL';
            renderer = new THREE.WebGLRenderer({
                antialiasing: true
            });
        } else {
            renderType = 'Canvas';
            renderer = new THREE.CanvasRenderer();
        }

        console.log('RENDERER_CONTEXT:', renderType);
    }

    function resizeScene(){
        renderer.setSize($container.width(), $container.height());
    }

    function createCamera(){
        camera = new THREE.PerspectiveCamera(45, $container.width() / $container.height(), 1, 1000);
        camera.position.set(0, 0, 750);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    function createScene(){
        scene = new THREE.Scene();
    }

    function render(){
        requestAnimationFrame( render );
        renderer.render(scene, camera);
    }

    function addToScene(object){
        scene.add(object);
    }

    _this.addToScene = addToScene;

    init();
};


var chartScene = new ChartScene('scene');

var material = new THREE.LineBasicMaterial({
    color: 0x1595D3,
    linewidth: 2,
    linecap: 'round',
    linejoin: 'round'
});

var geometry = new THREE.Geometry();

geometry.vertices.push(new THREE.Vector3(0, 0, 0));
geometry.vertices.push(new THREE.Vector3(0, 20, 0));
geometry.vertices.push(new THREE.Vector3(20, 0, 0));

var line = new THREE.Line(geometry, material);

chartScene.addToScene(line);