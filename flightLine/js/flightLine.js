// 球面取点方法
function getPos(radius, a, b)  {
    let x = radius * Math.sin(a) * Math.cos(b);
    let y = radius * Math.sin(a) * Math.sin(b);
    let z = radius * Math.cos(a);
    return {x, y, z}; // { x: x, y: y, z: z}
}

// 随机设置点
function setRandomDot(group, radius) {
    let dotGeo = new THREE.SphereGeometry(10, 20, 20);
    let dotMater = new THREE.MeshPhongMaterial({
        color: '#0ff'
    });
    let dotMesh = new THREE.Mesh(dotGeo, dotMater);
    let pos = getPos(radius, Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
    dotMesh.position.set(pos.x, pos.y, pos.z);
    group.add(dotMesh);
}

// 添加线条
function addLines(v0, v3) {
    // 夹角
    let angle = v0.angleTo(v3) * 270 / Math.PI / 10; // 0 ~ Math.PI
    let aLen = angle * 50,
        hLen = angle * angle * 120;
    let p0 = new THREE.Vector3(0, 0, 0);

    // 开始，结束点
    // let v0 = groupDots.children[0].position;
    // let v3 = groupDots.children[1].position;

    // 法线向量
    let rayLine = new THREE.Ray(p0, getVCenter(v0.clone(), v3.clone()));

    // 顶点坐标
    let vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0));

    // 控制点坐标
    let v1 = getLenVcetor(v0.clone(), vtop, aLen);
    let v2 = getLenVcetor(v3.clone(), vtop, aLen);

    // 绘制贝塞尔曲线
    let curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
    let geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(50);
    let material = new THREE.LineBasicMaterial({color: 0xffffff});

    return {
        curve: curve,
        lineMesh: new THREE.Line(geometry, material)
    };
}

// 计算v1,v2 的中点
function getVCenter(v1, v2) {
    let v = v1.add(v2);
    return v.divideScalar(2);
}

// 计算V1，V2向量固定长度的点
function getLenVcetor(v1, v2, len) {
    let v1v2Len = v1.distanceTo(v2);
    return v1.lerp(v2, len / v1v2Len);
}
