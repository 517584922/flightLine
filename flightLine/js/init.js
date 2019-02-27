//  兼容性判断
if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

let container, stats;
let camera, scene, renderer, controls;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedObjects = [];

let composer, effectFXAA, outlinePass, renderPass;

let [radius,vIndex,eIndex] = [600,0,0];

let groupDots = new THREE.Group();
let groupLines = new THREE.Group();
let aGroup = new THREE.Group();

let width = window.innerWidth;
let height = window.innerHeight;

let loader , onLoad;


let kk = new Array();
let kz = new Array();
let effectArray = new Array();


init();
model();
effectComposer();
animate();

function init() {

    // 画布
    container = document.createElement('div');
    document.body.appendChild(container);

    // WebGL渲染器
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    // 场景、相机、orbit控制器
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(-2000,2000,-2000);
    camera.lookAt({x: 0, y: 0, z: 0});

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // 光
    let light = new THREE.DirectionalLight(0xddffdd, 0.6);
    light.position.set(1, 1, 1);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    let k = 10;
    light.shadow.camera.left = -k;
    light.shadow.camera.right = k;
    light.shadow.camera.top = k;
    light.shadow.camera.bottom = -k;
    light.shadow.camera.far = 1000;

    scene.add(light);
    scene.add(new THREE.AmbientLight(0xaaaaaa, 0.6));

    // 后期处理
    composer = new THREE.EffectComposer(renderer);
    renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 帧
    stats = new Stats();
    container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('touchmove', onTouchMove);

    function onTouchMove(event) {

        let x, y;

        if (event.changedTouches) {

            x = event.changedTouches[0].pageX;
            y = event.changedTouches[0].pageY;

        } else {

            x = event.clientX;
            y = event.clientY;

        }

        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;

    }
}

function onWindowResize() {

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);

    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

}

function model() {
    // 地球
    let earthGeo = new THREE.SphereGeometry(radius, 100, 100);
    let earthMater = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('img/earth.jpg'),
        side: THREE.DoubleSide
    });
    let earthMesh = new THREE.Mesh(earthGeo, earthMater);
    kk.push(earthMesh);
    scene.add(earthMesh);

    // 定位点
    for (let i = 0; i < 100; i++) {
        setRandomDot(groupDots, radius);
    }
    scene.add(groupDots);

    // 飞行线（贝塞尔曲线）
    let animateDots = [];
    groupDots.children.forEach(elem => {
        let line = addLines(groupDots.children[0].position, elem.position);
        groupLines.add(line.lineMesh);
        animateDots.push(line.curve.getPoints(100));
    });
    scene.add(groupLines);

    // 飞行点
    for (let i = 0; i < animateDots.length; i++) {
        let aGeo = new THREE.SphereGeometry(10, 10, 10);
        let aMater = new THREE.MeshPhongMaterial({color: 0xFF0000});
        let aMesh = new THREE.Mesh(aGeo, aMater);
        aGroup.add(aMesh);
    }
    scene.add(aGroup);

    // 添加动画
    function animateLine() {
        aGroup.children.forEach((elem, index) => {
            let v = animateDots[index][vIndex];
            elem.position.set(v.x, v.y, v.z);
        });
        vIndex++;
        if (vIndex > 100) {
            vIndex = 0;
        }
        requestAnimationFrame(animateLine);
    }
    animateLine();
}

function effectComposer() {
    for (let z in aGroup.children){
        kz.push(aGroup.children[z])
    }

    // 自定义outlinePass配置
    makeParticle.effectParam(effectArray,1.2,0.32,1.2,0,false,0x3aaafa,0xFF0000);
    makeParticle.effectParam(effectArray,1.2,0.32,1.2,0,false,0xfa3939,0xFF0000);

    // 将outlinePass绑定到模型上
    makeParticle.effectBinding(kk,effectArray[0]);
    makeParticle.effectBinding(kz,effectArray[1]);

    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    effectFXAA.renderToScreen = true;
    composer.addPass(effectFXAA);

}

function animate() {

    requestAnimationFrame(animate);

    stats.begin();

    controls.update();

    composer.render();

    stats.end();

}



