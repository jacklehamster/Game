window.onload = function() {
    var coreTime = 0;
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( innerWidth, innerHeight );
    renderer.setPixelRatio(window.devicePixelRatio);
    var camera = new THREE.OrthographicCamera(-innerWidth/2, innerWidth/2, innerHeight/2, -innerHeight/2, 0.1, THREE.Infinity );
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    camera.position.set(0,0,600);
    document.body.appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x777777, transparent: false, opacity: 1}
        )
    );
    background.position.set(0,0,0);
    background.geometry.scale(960,600,1);
    scene.add(background);

    var background2 = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x777777, transparent: true, opacity: 1}
        )
    );
    background2.position.set(0,0,2);
    background2.geometry.scale(960,600,1);
    scene.add(background2);

    var platformMat = {
        platform: makeMat('platform',[ 0 ]),
    };


    var platform = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        platformMat.platform[0]
    );
    platform.position.set(0,0,0);
    platform.geometry.scale(800,200,1);
    scene.add(platform);



    var punchArray = [ 4,5,5,0 ];

    var oldmanMat = {
        walk: makeMat('oldman',[ 0,1,2,3 ]),
        stand: makeMat('oldman',[ 0,2,0,2,0,2,0,2,7,7 ]),
        punch: makeMat('oldman',punchArray),
        hit: makeMat('oldman',[ 6 ]),
        sleep: makeMat('oldman',[ 7,7,7,8,8,8,9,9,9 ]),
        turn: makeMat('oldman',[ 10 ]),
        ko: makeMat('oldman',[ 11 ]),
    };

    var doorMat = {
        'close': makeMat('door',[0]),
        'open': makeMat('door',[1]),
    };

    var baseSize = 200;
    var gameState = 'intro';

    var leftPlayer =  new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        oldmanMat.stand[0]
    );
    leftPlayer.position.set(-300,0,1);
    leftPlayer.geometry.scale(-baseSize,baseSize,1);
    leftPlayer.direction = 1;
    leftPlayer.turnedHead = 0;
    leftPlayer.restTime = 0;
    leftPlayer.action = null;



//    var door = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
//        doorMat.close[0]
//    );
 //   door.position.set(300,12,0);
  //  door.geometry.scale(baseSize,baseSize,1);

 //   scene.add(door);
    scene.add(leftPlayer);

    var oldMen = new Array(3);
    for(var i=0;i<oldMen.length;i++) {
        var oldMan2 = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
            oldmanMat.stand[0]
        );
        oldMan2.position.set(100 + Math.random()*300,-100+Math.random()*200,1);
        oldMan2.geometry.scale(-baseSize,baseSize,1);
        oldMan2.scale.x = -1;
        scene.add(oldMan2);
        oldMen[i] = (oldMan2);
    }

    function updatePlayer() {
        if (gameState==='intro') {
            if(coreTime < 4000) {
                background2.material.opacity = 1 - Math.min(1, (coreTime-3000)/500);
            } else {
                console.log(coreTime);
                gameState = 'play';
            }
        }
        if(gameState==='play') {
            leftPlayer.visible = true;
            var dx = 0, dy = 0, punch = false;
            if(keyboard[37]) { dx--; }
            if(keyboard[39]) { dx++; }
            if(keyboard[32]) { punch=true; }
            if(keyboard[38]) { dy++; }
            if(keyboard[40]) { dy--; }

            if(punch) {
                leftPlayer.action = 'punch';
                if(dx * leftPlayer.direction < 0) {
                    leftPlayer.direction *= -1;
                    leftPlayer.turnedHead = 0;
                    leftPlayer.scale.x *= -1;
                }
            } else if(dx * leftPlayer.direction < 0) {
                if(!leftPlayer.turnedHead || coreTime - leftPlayer.turnedHead < 250) {
                    if(!leftPlayer.turnedHead) {
                        leftPlayer.turnedHead = coreTime;
                    }
                    leftPlayer.action = 'turn';
                } else {
                    leftPlayer.direction *= -1;
                    leftPlayer.turnedHead = 0;
                    leftPlayer.action = 'walk';
                    leftPlayer.scale.x *= -1;
                }
            } else if(!dx && !dy) {
                if (leftPlayer.action !== 'stand' && leftPlayer.action !== 'sleep') {
                    leftPlayer.action = 'stand';
                    leftPlayer.restTime = coreTime;
                }
            } else {
                leftPlayer.action = 'walk';
            }

            if (leftPlayer.action === 'stand' && coreTime - leftPlayer.restTime > 10000) {
                leftPlayer.action = 'sleep';
            }


            for(var i=0; i<oldMen.length;i++) {
                var oldMan2 = oldMen[i];
                if(oldMan2.action==='hit' || oldMan2.action === 'ko') {
                    if(coreTime - oldMan2.hitTime > 200) {
                        oldMan2.action = 'ko';
                    }
                } else {
                    if(dist2d(oldMan2.position, leftPlayer.position) > 100) {
                        var odx = leftPlayer.position.x - oldMan2.position.x;
                        var ody = leftPlayer.position.y - oldMan2.position.y;
                        var dist = Math.sqrt(odx*odx+ody*ody);
                        oldMan2.position.x += odx/dist/2;
                        oldMan2.position.y += ody/dist/2;
                        oldMan2.position.z = 200 - oldMan2.position.y;
                        oldMan2.action = 'walk';
                        if(odx * oldMan2.scale.x < 0) {
                            oldMan2.scale.x *= -1;
                        }
                    } else {
                        if(leftPlayer.action==='punch'&& punchArray[Math.floor(coreTime/100) % punchArray.length] === 5) {
                            oldMan2.action='hit';
                            oldMan2.position.x -= oldMan2.scale.x;
                            oldMan2.hitTime = coreTime;
                        } else {
                            oldMan2.action = 'punch';
                        }
                    }
                }

                animate(oldMan2, oldmanMat[oldMan2.action]);
                if(oldMan2.action === 'punch' && punchArray[Math.floor(coreTime/100) % punchArray.length] === 5) {
                    leftPlayer.action = 'hit';
                    leftPlayer.position.x -= leftPlayer.scale.x;
                }
            }


            var animation = oldmanMat[leftPlayer.action || 'stand'];
            animate(leftPlayer, animation);
            move(leftPlayer, dx, dy);
        }

        if(gameState==='wake') {
            showText(conversation[conversationIndex]);
        } else {
            showText(null);
        }

        if(leftPlayer.action==='walk') {
            if (coreTime - lastStep > 200) {
                lastStep = coreTime;
                playSound('step.ogg');
            }
        }

        if(gameState==='exit') {
            if(coreTime - openDoorTime<200) {
                leftPlayer.visible = false;
                animate(door, doorMat.open);
            } else if(coreTime - openDoorTime<500) {
                animate(door, doorMat.close);
            } else if(coreTime - openDoorTime<2000) {
                background2.material.opacity = Math.min(1, (coreTime - openDoorTime-500)/500);
            } else if(gameState!=='next') {
                gameState = 'next';
                location.href = 'index2.html';
            }
        }
    }

    var lastStep  =0;

    function animate(mesh, animation) {
        var index = Math.floor(coreTime/100);
        mesh.material = animation[index % animation.length];
    }

    function move(mesh, dx, dy) {
        if(mesh.action==='walk' && (dx||dy)) {
            var dist = Math.sqrt(dx*dx+dy*dy);
            mesh.position.x += dx/dist;
            mesh.position.y += dy/dist;
            mesh.position.y = Math.min(mesh.position.y,0);
            mesh.position.z = 200-mesh.position.y;
        }
    }

    var conversationIndex = 0;
    var conversation = [
        'Oh no, I overslept!',
        'Breakfast started in the cantina 15 min ago',
        "If I don't hurry,",
        "they're going to run out of eggs!",
        null,
    ];

    setCheckKeyboard(function (keys) {
        switch(gameState) {
            case 'sleep':
                if(keys[32])
                    gameState = 'wake';
                break;
            case 'wake':
                if (dialog) {
                    if(keys[32]) {
                        if(dialog.innerText===conversation[conversationIndex]) {
                            conversationIndex++;
                            if(!conversation[conversationIndex]) {
                                gameState = 'play';
                            }
                        }
                    }
                }
                break;
            case 'play':
                if(keys[32]) {
/*                    if(dist2d(door.position, leftPlayer.position)<20) {
                        gameState = 'exit';
                        openDoorTime = coreTime;
                    }*/
                }
                break;
        }
        updatePlayer();
    });

    var openDoorTime = 0;
    var timeText = 0;
    var prevText = null;
    var dialog = null;
    function showText(string) {
        dialog = document.getElementById('dialog');
        if(!dialog) {
            dialog = document.createElement('span');
            dialog.id = 'dialog';
            dialog.style.position = 'absolute';
            dialog.style.fontSize = '32px';
            dialog.style.left = '50%';
            dialog.style.top = '60px';
            dialog.style.fontFamily = '"Comic Sans MS", cursive, sans-serif';
            document.body.appendChild(dialog);
        }
        if(!string) {
            dialog.style.display = 'none';
            return;
        }
        if(prevText !== string) {
            prevText = string;
            timeText = coreTime;
        }
        var resultText = string.slice(0,Math.floor((coreTime - timeText)/60));
        if (dialog.innerText !== resultText) {
            dialog.style.display = '';
            if(resultText[-1] !== ' ') {
                playSound('bip.ogg');
            }

            dialog.innerText = resultText;
            dialog.style.left = 'calc(50% - '+ dialog.offsetWidth/2 +'px)';
        }
    }


    var keyboard = window.k = setupKeyboard();
    function loop(time) {
        coreTime = time;
        updatePlayer();

        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);
};