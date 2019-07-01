'use strict';

require(['threejs', 'dobuki'], function (THREE, DOK) {
    window.DOK = DOK;

    var debug = {
        fps: location.search.indexOf("fps") >= 0
    };

    document.getElementById("fps").style.display = debug.fps ? "" : "none";

    var engine = new DOK.Engine({
        canvas: document.getElementById('abc')
    });

    var images = {
        squid: {
            normal: [require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,0,32,32"), require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,0,32,32"), require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,32,32,32"), require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,32,32,32")],
            shadow: [require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,0,32,32|shadow"), require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,0,32,32|shadow"), require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,32,32,32|shadow"), require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,32,32,32|shadow")]
        },
        floor: require.toUrl("https://jacklehamster.github.io/dok/images/wood.png"),
        lava: require.toUrl('lava.png'),
        sand: [require.toUrl('gold.jpg'), require.toUrl('gold.jpg|scale:-1,1'), require.toUrl('gold.jpg|scale:1,-1'), require.toUrl('gold.jpg|scale:-1,-1')],
        water: [require.toUrl("water.jpg"), require.toUrl("water.jpg|scale:-1,1"), require.toUrl("water.jpg|scale:1,-1"), require.toUrl("water.jpg|scale:-1,-1")],
        sprite: [],
        border: []
    };
    DOK.SpriteSheet.preLoad(images);

    function getBorderedImage(index) {
        if (index in DOK.SpriteSheet.spritesheet.border) {
            return DOK.SpriteSheet.spritesheet.border[index];
        }
        var cut = DOK.SpriteSheet.getCut(index);
        images.border[index] = cut.url + "|border:10%";
        DOK.SpriteSheet.preLoad(images);
        return DOK.SpriteSheet.spritesheet.border[index];
    }

    var spriteRenderer = new DOK.SpriteRenderer();
    engine.scene.add(spriteRenderer.mesh);
    window.spriteRenderer = spriteRenderer;
    spriteRenderer.curvature = .5;
    //    spriteRenderer.bigwave = 15;


    //    var mouse = {x:0,y:0};
    /*    document.addEventListener("mousemove", function(e) {
     mouse.x = e.pageX - innerWidth/2;
     mouse.y = e.pageY - innerHeight/2;
     e.preventDefault();
     });
     */

    var range = 50;
    var cellSize = 256;
    engine.renderer.setClearColor(0xffffff, 1);

    var roundabout = new DOK.Utils.Roundabout();
    var closestPoint = { x: 0, y: 0 };
    function getClosestSpritePosition(x, y, limit) {
        x = Math.round(x);
        y = Math.round(y);
        roundabout.reset();
        //        console.log(x,y);

        for (var i = 0; i < limit; i++) {
            var pos = roundabout.next();
            var sprites = spriteCollection.get(x + pos[0], y + pos[1]);
            if (sprites && !empty(sprites)) {
                closestPoint.x = x + pos[0];
                closestPoint.y = y + pos[1];
                return closestPoint;
            }
        }
        return null;
    }

    function empty(obj) {
        for (var i in obj) {
            return false;
        }
        return true;
    }

    function picked(obj) {
        return obj.uid === pickedItem;
    }

    var mouseControl = false;
    var selectedObj = { x: 0, y: 0 };
    function getSelected() {
        if (!mouseControl) {
            return null;
        }
        //        var xPos = camera.position.x + mouse.x * 2;
        //        var yPos = camera.position.y - 2 * mouse.y;

        var xPos = mousePos.x;
        var yPos = mousePos.y;
        if (selectedObj.x !== Math.round(xPos / cellSize) || selectedObj.y !== Math.round(yPos / cellSize)) {
            selectedObj.x = Math.round(xPos / cellSize);
            selectedObj.y = Math.round(yPos / cellSize); // + 6;
        }
        return selectedObj;
    }

    function getCamPos() {
        var xPos = camera.position.x;
        var yPos = camera.position.y;

        selectedObj.x = Math.round(xPos / cellSize);
        selectedObj.y = Math.round(yPos / cellSize) + 6;
        return selectedObj;
    }

    var collection = new DOK.Collection({
        type: "grid",
        get x() {
            return getCamPos().x - Math.floor(range / 2);
        },
        get y() {
            return getCamPos().y - Math.floor(range / 2);
        },
        width: range,
        height: range
    }, function (x, y) {
        var frame = Math.floor(DOK.Loop.time / 100);
        var sel = getSelected();
        var selected = sel && !spritePos && pickedItem === null && sel.x === x && sel.y === y;
        var light = .7;
        var wave = 0;
        var anim = DOK.SpriteSheet.spritesheet.sand;
        var img = anim[Math.abs(x * 13 ^ y * 7) % anim.length];
        if (selected && Math.floor(DOK.Loop.time / 10) % 4 !== 0) {
            img = getBorderedImage(img);
        }

        return DOK.SpriteObject.create(x * cellSize, y * cellSize, 0, //c!==0?0:-64,
        cellSize, cellSize, DOK.Camera.quaternions.southQuaternionArray, img, light, //c!==0?1:1.5,
        wave);
    });

    function spriteSelection() {
        var sel = spritePos;
        return sel ? spriteCollection.get(sel.x, sel.y) : null;
    }

    var spriteCubes = [];
    function spriteCube(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = this.options.cellSize * 3;
        var pickedMe = picked(spriteInfo);
        var light = pickedMe ? Math.random() : 1;
        //spritePos && Math.floor(x)===spritePos.x&& Math.floor(y)===spritePos.y ? Math.random() : 1;
        var selected = spritePos && Math.floor(x) === spritePos.x && Math.floor(y) === spritePos.y;
        var img = DOK.SpriteSheet.spritesheet.sprite[index];
        if (!pickedMe && selected && Math.floor(DOK.Loop.time / 10) % 4 !== 0) {
            img = getBorderedImage(img);
        }

        spriteCubes.push(DOK.SpriteObject.create(x * cellSize, y * cellSize, size / 2, size, size, DOK.Camera.quaternions.southQuaternionArray, img, light, 15));
        spriteCubes.push(DOK.SpriteObject.create(x * cellSize - 10, y * cellSize, size / 2, size, size, DOK.Camera.quaternions.westQuaternionArray, img, light, 15));
        spriteCubes.push(DOK.SpriteObject.create(x * cellSize + 10, y * cellSize, size / 2, size, size, DOK.Camera.quaternions.eastQuaternionArray, img, light, 15));
        spriteCubes.push(DOK.SpriteObject.create(x * cellSize, y * cellSize, size / 2, size, size, DOK.Camera.quaternions.eastQuaternionArray, img, light, 15));
        spriteCubes.forEach(setTypeCube);
        return spriteCubes;
    }

    function setTypeCube(spriteObj) {
        spriteObj.type = 'face';
    }

    function spriteFace(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = this.options.cellSize * 3;
        var pickedMe = picked(spriteInfo);
        var light = pickedMe ? Math.random() : 1;
        var wave = 0; //15
        //spritePos && Math.floor(x)===spritePos.x&& Math.floor(y)===spritePos.y ? Math.random() : 1;
        var selected = spritePos && Math.floor(x) === spritePos.x && Math.floor(y) === spritePos.y;
        var img = DOK.SpriteSheet.spritesheet.sprite[index];
        if (!pickedMe && selected && Math.floor(DOK.Loop.time / 10) % 4 !== 0) {
            img = getBorderedImage(img);
        }

        var spriteObj = DOK.SpriteObject.create(x * cellSize, y * cellSize, size / 2, size, size, null, img, light, wave);
        spriteObj.type = "face";
        return spriteObj;
    }

    var spriteCollection = DOK.Collection.createSpriteCollection({
        cellSize: cellSize,
        spriteFunction: function spriteFunction(spriteInfo) {
            switch (spriteInfo.type) {
                case 'face':
                    return spriteFace.call(this, spriteInfo);
                    break;
                case 'cube':
                    return spriteCube.call(this, spriteInfo);
                    break;
            }
        }
    });
    window.ss = spriteCollection;

    var camera = DOK.Camera.getCamera();
    //    var mz = 0, rot = 0;
    var camGoal = {
        x: camera.position.x, y: camera.position.y
    };

    var mousePos = new THREE.Vector3();
    /*    document.addEventListener("mousemove", function(event) {
     mouseMoveTo(event.pageX, event.pageY);
     event.preventDefault();
     });
     */
    var pickedItem = null;
    /*    document.addEventListener("mousedown", function(event) {
     for(var uid in spriteSelection()) {
     pickedItem = uid;
     }
     });
      document.addEventListener("mouseup", function(event) {
     pickedItem = null;
     });
     */

    /*
     var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
     var material = new THREE.MeshNormalMaterial();
     var egg = new THREE.Mesh(geometry, material);
     egg.position.set(0,0,0);
     egg.geometry.scale(8,10,8);
     scene.add(egg);
     */

    /*    const request = new XMLHttpRequest();
        request.open("GET", "config.json", true);
        request.addEventListener("load", function() {
            const config= JSON.parse(request.responseText);
            DOK.Camera.setCameraPosition(config.camera);
        });
        request.send(null);
    */

    function createSprite(index) {
        if (!getSelected()) {
            return;
        }
        var x = getSelected().x; //getCamPos().x,
        var y = getSelected().y; //getCamPos().y,
        var spriteInfo = spriteCollection.create(x, y, index);
        spriteInfo.type = 'face';
        //        console.log("DROPPED",spriteInfo);

        /*        var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
         var material = new THREE.MeshNormalMaterial();
         var egg = new THREE.Mesh(geometry, material);
         egg.position.set(getSelected().x*64,getSelected().y*64,0);
         egg.geometry.scale(8,8,8);
         scene.add(egg);*/
        /*
         var geometry = new THREE.PlaneGeometry(1,1);
         var material = new THREE.MeshNormalMaterial();
         var egg = new THREE.Mesh(geometry, material);
         egg.position.set(getSelected().x*64,getSelected().y*64,0);
         egg.geometry.scale(8,8,8);
         egg.rotateX(Math.PI);
         scene.add(egg);
         */
        /*
         return DOK.create(DOK.SpriteObject).init(
         x*cellSize,y*cellSize,size/2,
         size,size,
         null,
         1,
         DOK.spritesheet.sprite[index]
         );
         */
    }

    function cancel(e) {
        e = e || event;
        //console.log(e.dataTransfer);
        //        mouse.x = e.pageX - innerWidth/2;
        //        mouse.y = e.pageY - innerHeight/2;
        mouseMoveTo(e.pageX, e.pageY);
        e.preventDefault();
        return false;
    }

    function drop(e) {
        e = e || event;
        var dt = e.dataTransfer;
        var reader = new FileReader();
        var file = dt.files[0];
        //        console.log(e);
        reader.addEventListener('loadend', function (e) {
            //console.log(file.type);
            if (['image/gif', 'image/jpeg', 'image/png'].indexOf(file.type) < 0) {
                return;
            } else if (file.size > 10000000) {
                return;
            }
            var img = new Image();
            img.addEventListener("load", function (e) {
                //console.log(img);
                //        images['floor'] = img.src;
                var index = images.sprite.length;
                images.sprite.push(img.src);
                DOK.SpriteSheet.preLoad(images);

                createSprite(index);

                /*            document.getElementById("sidebar").appendChild(img);
                 img.style.cursor = "pointer";
                 img.addEventListener("click", function(e) {
                 createSprite(index);
                  });*/
                //    img.addEventListener("click", function(e) {
                //
                //  });
                //        DOK.preLoad(images);
                /*        hero[5] = mx - img.naturalWidth/2;
                 hero[6] = my - img.naturalHeight/2;
                 hero[7] = img.naturalWidth;
                 hero[8] = img.naturalHeight;*/
            });

            img.src = this.result;
            reader = null;
        });

        reader.readAsDataURL(file);
        e.preventDefault();
        return false;
    }
    document.addEventListener('dragover', cancel);
    document.addEventListener('dragenter', cancel);
    document.addEventListener('dragleave', cancel);
    document.addEventListener('drop', drop);

    /*
     var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
     var material = new THREE.MeshNormalMaterial();
     var egg = new THREE.Mesh(geometry, material);
     egg.position.set(0,0,0);
     egg.geometry.scale(8,10,8);
     scene.add(egg);
     */

    //    var raycaster = new THREE.Raycaster();
    ///  var mouse = new THREE.Vector2();
    var spritePos = null;
    var mouseMoveToVector = new THREE.Vector3();
    var mouseVector = new THREE.Vector3();
    function mouseMoveTo(x, y) {
        /*        mouse.x = x;
         mouse.y = y;
          var camera = DOK.getCamera();
         raycaster.setFromCamera( mouse, camera );
         var intersects = raycaster.intersectObjects( [spriteRenderer.mesh] );
          if ( intersects.length > 0 ) {
          var intersect = intersects[0];
         console.log(intersect);
         egg.position.x = intersect.point.x;
         egg.position.y = intersect.point.y;
         egg.position.z = intersect.point.z;
         }*/

        /*
         // Parse all the faces
         for ( var i in intersects ) {
          intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );
          }
         */

        mouseMoveToVector.set(x / window.innerWidth * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);

        mouseMoveToVector.unproject(camera);

        var dir = mouseMoveToVector.sub(camera.position).normalize();

        var distance = -camera.position.z / dir.z;

        mouseVector.copy(camera.position);
        var pos = mouseVector.add(dir.multiplyScalar(distance));
        mousePos.x = pos.x;
        mousePos.y = pos.y;
        mousePos.z = pos.z;

        if (pickedItem) {
            spritePos = null;
            var sprite = spriteCollection.find(pickedItem);
            sprite.move(pos.x / cellSize, pos.y / cellSize);
            //            console.log(pickedItem);
        } else {
            var sel = getSelected();
            if (sel) {
                spritePos = getClosestSpritePosition(sel.x, sel.y, 20);
            }
            //            console.log(spritePos);
        }
        //        console.log(spritePos);
    }

    DOK.SpriteRenderer.setIndexProcessor(function (images, count) {
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            image.zIndex += image.spriteObject.type === "face" ? 10000 : image.spriteObject.type === "cube" ? 10000 : 0;
        }
    });

    var zoombar = .7;
    var zoomState = [{ distance: 200, angle: 1.3 }, { distance: 1000, angle: .3 }];

    function setMouseControl() {
        mouseControl = true;

        DOK.Mouse.setOnWheel(function (dx, dy) {
            zoombar = Math.max(0, Math.min(1, zoombar - dy / 300));
        });

        DOK.Mouse.setOnZoom(function (pinchSize) {
            zoombar = Math.max(0, Math.min(1, zoombar + pinchSize / 200));
        });
        DOK.Mouse.setOnTouch(function (dx, dy, down, pageX, pageY) {
            if (dx !== null && dy !== null) {
                if (pickedItem !== null) {
                    mouseMoveTo(pageX, pageY);
                } else if (down) {
                    camGoal.x = camera.position.x - dx * 20;
                    camGoal.y = camera.position.y + dy * 20;
                } else {
                    mouseMoveTo(pageX, pageY);
                }
                //            mz -= dy/2;
                //            rot += (dx/1000);
            } else {
                if (down) {
                    camGoal.x = camera.position.x;
                    camGoal.y = camera.position.y;
                    var sel = spriteSelection();
                    if (sel) {
                        for (var i = 0; i < sel.length; i++) {
                            pickedItem = sel[i].uid;
                            break;
                        }
                    }
                } else {
                    pickedItem = null;
                }
            }
        });
    }

    function updateCamera() {
        var camera = DOK.Camera.getCamera();
        camera.position.x += (camGoal.x - camera.position.x) / 3;
        camera.position.y += (camGoal.y - camera.position.y) / 3;
        camera.position.z = zoombar * zoomState[0].distance + (1 - zoombar) * zoomState[1].distance;
        camera.rotation.x = zoombar * zoomState[0].angle + (1 - zoombar) * zoomState[1].angle;
    }

    var hero = { x: 0, y: 0, img: 'squid', speed: .05 };

    var centerCam = true;
    DOK.Loop.addLoop(function () {
        var mov = DOK.Keyboard.getMove();
        if (mov.x || mov.y) {
            var dist = Math.sqrt(mov.x * mov.x + mov.y * mov.y);
            hero.x += mov.x / dist * hero.speed;
            hero.y += mov.y / dist * hero.speed;
            centerCam = true;
        }
        if (centerCam) {
            var dx = (hero.x * cellSize - camGoal.x) / 5;
            var dy = (hero.y * cellSize - 1000 - camGoal.y) / 5;
            camGoal.x += dx;
            camGoal.y += dy;
            if (Math.abs(dx) < .1 || Math.abs(dy) < .1) {
                centerCam = false;
            }
        }
    });

    var actorsList = [hero];
    var actors = new DOK.Collection({
        array: []
    }, function (actor) {
        var array = this.options.array;
        array.length = 0;
        var frame = Math.floor(DOK.Loop.time / 100);
        var light = 1;
        var wave = 0;
        var animation = DOK.SpriteSheet.spritesheet[actor.img].normal;
        var img = animation[frame % animation.length];

        array[0] = DOK.SpriteObject.create(actor.x * cellSize, actor.y * cellSize, 0, //c!==0?0:-64,
        cellSize, cellSize, null, img, light, //c!==0?1:1.5,
        wave);
        array[0].type = 'face';

        return array;
    }, function (callback) {
        for (var i = 0; i < actorsList.length; i++) {
            var obj = this.getSprite(actorsList[i]);
            if (Array.isArray(obj)) {
                obj.forEach(callback);
            } else {
                callback(obj);
            }
        }
    });

    //    DOK.Loop.fps = 45;
    var frame = 0;
    DOK.Loop.addLoop(function () {
        if (!engine.ready) {
            return;
        }
        updateCamera();
        frame++;
        collection.forEach(spriteRenderer.display);
        spriteCollection.forEach(spriteRenderer.display);
        actors.forEach(spriteRenderer.display);
        spriteRenderer.updateGraphics();
        if (debug.fps && frame % 10 === 0) document.getElementById("fps").textContent = DOK.Loop.fps + " fps";
    });

    setMouseControl();
});
//# sourceMappingURL=main.js.map