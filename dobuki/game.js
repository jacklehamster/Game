window.onload = function() {
    initGame();

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x003366, transparent: false, opacity: 1}
        )
    );
    background.position.set(0,0,-100);
    background.geometry.scale(900,600,1);
    core.scene.add(background);

};