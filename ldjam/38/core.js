var noMat = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );

function setResizer(renderer, camera) {
    window.addEventListener("resize",function() {
        var gameWidth = innerWidth;
        var gameHeight = innerHeight;
        renderer.setSize( gameWidth, gameHeight );
        camera.left = -gameWidth / 2;
        camera.right = gameWidth / 2;
        camera.top = gameHeight / 2;
        camera.bottom = -gameHeight / 2;
        camera.updateProjectionMatrix();
    });
}

function updatePosition(lyco) {
    lyco.position.z = 200-lyco.position.y - (lyco.offset?lyco.offset.y:0);
}

function reshuffle(yellowCount, pinkCount, minone) {
    if(yellowCount + pinkCount===0) {
        return [0,0];
    }
    var newYellowCount = (yellowCount * Math.random() | 0);
    var newPinkCount = (pinkCount * Math.random() | 0);
    if(!newYellowCount && !newPinkCount && minone) {
        if(yellowCount) {
            newYellowCount = 1;
        } else if(pinkCount) {
            newPinkCount = 1;
        }
    }
    return [newYellowCount, newPinkCount];
}

function moveLupin(lupin, keyboard, scale) {
    if(loadingScene) {
        return;
    }
    var dx = 0, dy = 0;
    if(keyboard[39]) {
        dx ++;
    }
    if(keyboard[37]) {
        dx --;
    }
    if(keyboard[38]) {
        dy++;
    }
    if(keyboard[40]) {
        dy--;
    }
    if(lupin.ko) {
        dx = dy = 0;
    } else {
        lupin.dx = dx*3*scale;

        if(gravity && !onStairs(lupin.position)) {
            if(lupin.inAir && lupin.lastDx) {
                lupin.dx = lupin.lastDx;
            }

            if(waitForJump) {
                if(dx)
                    dy = 1;
                else if(dy > 0) {
                    lupin.dx = lupin.lastDx < 0 ? -2*scale : 2*scale;
                }
            }

            if(dy>0 && !lupin.inAir && !waitRelease[38]) {
                if(waitForJump) {
                    lupin.dy = dy*20;
                    waitForJump = false;
                } else {
                    lupin.dy = dy*(lupin.jumpHeight || 14);
                }
                lupin.inAir = true;
            }
        } else {
            lupin.dy = dy*2*scale;
        }
    }

    if(lupin.dx)
        lupin.lastDx = lupin.dx;

    lupin.position.x += lupin.dx * (lupin.inAir ? 1.8 : 1);
    if(lupin.position.x < -450) {
        lupin.position.x += 900;
    } else if(lupin.position.x > 450) {
        lupin.position.x -= 900;
    }

    var onTheStairs = onStairs(lupin.position);
    if(gravity && !waitForJump && !onTheStairs) {
        lupin.dy--;
    }

    if(gravity) {
        var newY = lupin.position.y + lupin.dy;
        if(lupin.dy) {
            if(lupin.ko) {
                lupin.position.y = newY;
            } else if(onTheStairs) {
                var platform = crossedPlatform(lupin.position, newY);
                if(platform && lupin.dy<0) {
                    lupin.dy = 0;
                    lupin.position.y = platform.y;
                    lupin.inAir = false;
                    lupin.doubleJumped = false;
                } else {
                    lupin.position.y = newY;
                    lupin.inAir = false;
                    lupin.doubleJumped = false;
                    waitRelease[38] = true;
                }
            } else if(dy < 0 && onStairs({x:lupin.position.x, y:newY})) {
                lupin.position.y = newY;
                waitRelease[38] = true;
            } else {
                var platform = crossedPlatform(lupin.position, newY);
                if(platform && lupin.dy<0) {
                    lupin.dy = 0;
                    lupin.position.y = platform.y;
                    lupin.doubleJumped = false;
                    lupin.inAir = false;
                } else {
                    lupin.position.y = newY;
                }
            }
        }
    } else {
        lupin.position.y += lupin.dy;
    }

    if(runningLevel) {
        if(lupin.scale.x<0)
            lupin.scale.x *= -1;
    } else if(lupin.lastDx && lupin.lastDx * lupin.scale.x < 0) {
        lupin.scale.x *= -1;
    }
    updatePosition(lupin);
    checkPosition(lupin);
}

var platforms = [];
function addPlatform(platform) {
    platforms.push(platform);
    return platform;
}

function crossedPlatform(position, newY) {
    for(var i=0;i<platforms.length;i++) {
        var platform = platforms[i];
        if(Math.min(position.y, newY) <= platform.y
        && Math.max(position.y, newY) >= platform.y
        && position.x > Math.min(platform.x[0],platform.x[1])
        && position.x < Math.max(platform.x[0],platform.x[1])
        ) {
            return platform;
        }
    }
    return null;
}

var stairs = [];
function addStairs(stair) {
    stairs.push(stair);
}

function onStairs(pos) {
    for(var i=0;i<stairs.length;i++) {
        var firstPoint = stairs[i][0];
        var secondPoint = stairs[i][1];
        if(pos.x > Math.min(firstPoint.x,secondPoint.x)
        && pos.x < Math.max(firstPoint.x,secondPoint.x)
        && pos.y > Math.min(firstPoint.y,secondPoint.y)
        && pos.y < Math.max(firstPoint.y,secondPoint.y)) {
            return true;
        }
    }
    return false;
}

var lastIndex = 0;
function updateLupin(lupin, index, lupinMat) {
    if(loadingScene || lupin.hidden) {
        lupin.material = noMat;
        return;
    }
    var climbing = onStairs(lupin.position);
    if(climbing && lupin.dy===0 && lupin.dx===0) {
        index = lastIndex;
    }
    var color = lupin.color || 0;
    var action = lupin.ko ? 'ko' : lupin.drink ? 'drink' : runningLevel ? 'move' : climbing ? 'climb' : lupin.dx || lupin.dy ? 'move' : 'still';
    lupin.material = lupinMat[color][action][index%lupinMat[color][action].length];
    lastIndex = index;
}

function checkPosition(lupin) {
}

function setCheckPosition(func) {
    checkPosition = func;
}

var runningLevel = false;
function setRuningLevel(value) {
    runningLevel = value;
}

function setInitialPosition(lupin) {
    var hashInfo = location.hash.slice(1).split(',');
    if(hashInfo.length<4) return;
    lupin.position.x = parseInt(hashInfo[0]);
    lupin.position.y = parseInt(hashInfo[1]);
    lupin.lastDx = parseInt(hashInfo[2]);
    lupin.color = parseInt(hashInfo[3]);
}

var loadingScene = false;
function loadScene(scene, position, lupin) {
    if(loadingScene) {
        return;
    }
    loadingScene = true;
    var hash = position ? '#' + position.x + ',' + position.y + ',' + parseInt(position.dx) + ',' + ((lupin?lupin.color:0)||0) : '';
    var url = scene + '.html' + hash;
    location.replace(url);
}

var waitForJump = false;
function setWaitForJump(value) {
    waitForJump = value;
}

var gravity = false;
function setGravity(value) {
    gravity = value;
}

var waitRelease = {};
function setupKeyboard() {
    var keyboard = {};
    document.addEventListener("keydown", function(event) {
        event = event || window.event;
        keyboard[event.keyCode] = true;
//        console.log(event);
        event.preventDefault();
    });
    document.addEventListener("keyup", function(event) {
        event = event || window.event;
        keyboard[event.keyCode] = false;
        if(waitRelease[event.keyCode]) {
            waitRelease[event.keyCode] = false;
        }
        event.preventDefault();
    });

    return keyboard;
}

function getBeeMat() {
    return [
        0,1,2,
    ].map(function(num) {
        return 'img/bee-000'+num+'.png';
    }).map(function(file) {
        return THREE.ImageUtils.loadTexture(file);
    }).map(function(map) {
        return new THREE.MeshBasicMaterial({
            map:map,
            transparent:true,
            side: THREE.DoubleSide,
        });
    });
}

function getLycoMat() {
    return [
        {
            move: [
                0,1,2,3,
            ].map(function(num) {
                return 'img/lyco-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            squish: [
                4,5,6,7,
            ].map(function(num) {
                return 'img/lyco-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            drink: [
                8,9,10,10,10,10,10,10,10,9,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
            ].map(function(num) {
                num = (100+num).toString().slice(1);
                return 'img/lyco-yellow-00'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),
        },

        {
            move: [
                0,1,2,3,
            ].map(function(num) {
                return 'img/lyco-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),
            squish: [
                4,5,6,7,
            ].map(function(num) {
                return 'img/lyco-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),
            drink: [
                8,9,10,10,10,10,10,10,10,9,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
            ].map(function(num) {
                num = (100+num).toString().slice(1);
                return 'img/lyco-pink-00'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),
        },
    ];
}

function getLupinMat() {
    return [
        {
            still: [
                0,
            ].map(function(num) {
                return 'img/lupin-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            move: [
                1,2,3,4,
            ].map(function(num) {
                return 'img/lupin-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            climb: [
                5,5,6,6,
            ].map(function(num) {
                return 'img/lupin-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            drink: [
                8,8,8,8,8,8,8,8,8,8,9,9,9,
            ].map(function(num) {
                return 'img/lupin-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            ko: [
                7,
            ].map(function(num) {
                return 'img/lupin-yellow-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),
        },

        {
            still: [
                0,
            ].map(function(num) {
                return 'img/lupin-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            move: [
                1,2,3,4,
            ].map(function(num) {
                return 'img/lupin-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            climb: [
                5,5,6,6,
            ].map(function(num) {
                return 'img/lupin-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            drink: [
                8,8,8,8,8,8,8,8,8,8,9,9,9,
            ].map(function(num) {
                return 'img/lupin-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),

            ko: [
                7,
            ].map(function(num) {
                return 'img/lupin-pink-000'+num+'.png';
            }).map(function(file) {
                return THREE.ImageUtils.loadTexture(file);
            }).map(function(map) {
                return new THREE.MeshBasicMaterial({
                    map:map,
                    transparent:true,
                    side: THREE.DoubleSide,
                });
            }),
        },
    ];
}

function dist2d(a,b) {
    var dx = a.x-b.x;
    var dy = a.y-b.y;
    return Math.sqrt(dx*dx + dy*dy);
}