window.onload = function() {
    var renderer = new THREE.WebGLRenderer({antiAlias:true});
    renderer.setSize( WIDTH, HEIGHT );
    renderer.setPixelRatio(window.devicePixelRatio);
    var camera = new THREE.OrthographicCamera(-WIDTH/2, WIDTH/2, 144/2, -144/2, 0.1, THREE.Infinity );
//    var camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000000);
    var scene = new THREE.Scene();
    setResizer(renderer, camera);

    var ballsounds = [
        new Audio('snd/ball.ogg'),
        new Audio('snd/ball.ogg'),
        new Audio('snd/ball.ogg'),
    ];

    var totalWidth = 900;

    camera.position.set(0,0,600);
//    camera.rotateX(-.2);
    document.getElementById("game").appendChild( renderer.domElement );

    var background = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x005500, transparent: false, opacity: 1}
        )
    );

///    background.rotateX(-Math.PI/2);
    background.position.set(0,0,-100);
    background.geometry.scale(900,144,1);
    scene.add(background);

    var leftGoal = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x005500, transparent: false, opacity: 1}
        )
    );
    leftGoal.position.set(-460,-49,0);
    leftGoal.geometry.scale(20,46,1);
    scene.add(leftGoal);f

    var rightGoal = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x005500, transparent: false, opacity: 1}
        )
    );
    rightGoal.position.set(460,-49,0);
    rightGoal.geometry.scale(20,46,1);
    scene.add(rightGoal);

    var topBarBack = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x000055, transparent: false, opacity: 1}
        )
    );
    topBarBack.position.set(0,55,0);
    topBarBack.geometry.scale(850,16,1);
    scene.add(topBarBack);

    var topBar = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x005599, transparent: false, opacity: 1}
        )
    );
    topBar.position.set(0,55,1);
    topBar.geometry.scale(840,5,1);
    scene.add(topBar);


    var leftPlayer =  new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x338899, transparent: false, opacity: 1}
        )
    );
    leftPlayer.position.set(-400,0,0);
    leftPlayer.geometry.scale(50,50,1);
    leftPlayer.geometry.translate(0, 10, 0 );
    leftPlayer.radius = 15;
    window.l = leftPlayer;
    scene.add(leftPlayer);

    var rock = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x889933, transparent: false, opacity: 1}
        )
    );
    rock.type = 1;
    rock.position.set(400,-45,0);
    rock.geometry.scale(60,60,1);
    rock.geometry.translate(0, 12, 0 );
    rock.radius = 15;
    scene.add(rock);

    var girl = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
        new THREE.MeshBasicMaterial(
            {color: 0x889933, transparent: false, opacity: 1}
        )
    );
    girl.type = 0;
    girl.position.set(320,-45,0);
    girl.geometry.scale(50,50,1);
    girl.geometry.translate(0, 12, 0 );
    girl.radius = 15;
    scene.add(girl);



    var geometry = new THREE.SphereGeometry(1, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
//    var material = new THREE.MeshNormalMaterial();
    var tex = THREE.ImageUtils.loadTexture('img.jpeg');
    tex.repeat.x = 1/3;
    tex.repeat.y = 1/3;
    var material = new THREE.MeshLambertMaterial({
        map: tex
    });
    var ball = new THREE.Mesh(geometry, material);
    ball.position.set(0,0,0);
    ball.geometry.scale(10,10,10);
    ball.radius = 10;
    scene.add(ball);
    ball.bounce = .7;
    ball.canRotate = true;
    var light = new THREE.AmbientLight( 0xcccccc ); // soft white light
    scene.add( light );
    var light2 = new THREE.PointLight( 0xffffff, 1, 0, 5 );
    light2.position.set( -50, 250, 50 );
    scene.add( light2 );
    window.b = ball;

    var speed = 7, brake = .8, acc = .5;
    setCheckKeyboard(function(keyboard, time) {
        var dx = 0;
        if(keyboard[37]) dx--;
        if(keyboard[39]) dx++;
        var sliding = leftPlayer.slide && time-leftPlayer.slide<400;

        if(sliding) {
            leftPlayer.dx = leftPlayer.lastDx<0?-10:10;
        }

        if(dx<0) {
            leftPlayer.dx = Math.max(-speed,leftPlayer.dx-acc);
        }else if(dx>0) {
            leftPlayer.dx = Math.min(speed,leftPlayer.dx+acc);
        } else {
            leftPlayer.dx *= brake;
            if(Math.abs(leftPlayer.dx)<.1) {
                leftPlayer.dx = 0;
            }
        }
        if(leftPlayer.dx)
            leftPlayer.lastDx = leftPlayer.dx;
        var arrowUp = keyboard[38];
        var arrowDown = keyboard[40];
        if(arrowUp && arrowDown) {
            if(arrowUp>arrowDown) arrowDown = 0;
            else arrowUp = 0;
        }

        if(arrowUp) {
            if(!sliding && !leftPlayer.inAir) {
                leftPlayer.dy = 8;
                leftPlayer.inAir = time;
                leftPlayer.kick = 0;
            }
        }
        if(arrowDown) {
            if(!sliding && !leftPlayer.inAir) {
                leftPlayer.slide = time;
            }
        }


        /*
        if(keyboard[38]) {
            leftPlayer.dy = Math.min(speed,leftPlayer.dy+acc);
        } else if(keyboard[40]) {
            leftPlayer.dy = Math.max(-speed,leftPlayer.dy-acc);
        } else {
            leftPlayer.dy *= brake;
            if(Math.abs(leftPlayer.dy)<.1) {
                leftPlayer.dy = 0;
            }
        }*/
    });

    function playBallSound() {
        var b = ballsounds.shift();
        ballsounds.push(b);
        b.play();
    }

    var collisionSize = 25;
    function checkShots(time) {
        if(dist2d(leftPlayer.position, ball.position)<collisionSize) {
            var sliding = leftPlayer.slide && time-leftPlayer.slide<400;
            ball.dx = leftPlayer.dx*4+2+Math.max(0,-ball.dx/3);
            ball.dy = (sliding?3: 10)*Math.abs(leftPlayer.dx/5);//-(leftPlayer.position.y-ball.position.y)/20 + leftPlayer.dy;
            leftPlayer.kick = time;
            leftPlayer.lastDx = 1;
            playBallSound();
        }
        if(dist2d(rock.position, ball.position)<collisionSize) {
            ball.dx = -8 - Math.random()*4;
            ball.dy = leftPlayer.position.x>ball.position.x? 3 : 5+Math.random()*5;//-(rightPlayer.position.y-ball.position.y)/20 + rightPlayer.dy;
            rock.kick = time;
            playBallSound();
        }
        if(dist2d(girl.position, ball.position)<collisionSize) {
            ball.dx = -8 - Math.random()*4;
            ball.dy = leftPlayer.position.x>ball.position.x? 3 : 5+Math.random()*5;//-(rightPlayer.position.y-ball.position.y)/20 + rightPlayer.dy;
            girl.kick = time;
            playBallSound();
        }
    }

    var orgPos = {x:430,y:-50}; var enemySpeed = 5;
    var gg = {x:0,y:0};
    var energy = 10000;

    function moveToBall(rightPlayer, time, leftPlayer) {
        if(rightPlayer.type===0) {
            var goal;
            var phaseShift =  Math.sin(((time+133)/2000|0)*113) * 100;
            if(Math.abs(ball.position.x-leftPlayer.position.x)  > Math.abs(ball.position.x-rightPlayer.position.x)) {
                gg.y = ball.position.y;
                gg.x = ball.position.x + 50;
                goal = gg;
            } else {
                gg.y = ball.position.y;
                gg.x = ball.position.x + 300;
                goal = gg;
            }
            var dx = (goal.x + phaseShift) - rightPlayer.position.x;
            var dy = goal.y - rightPlayer.position.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            energy -= dist/10;
            energy+=5;
            energy = Math.max(0,Math.min(10000,energy));

            var speed = ball.position.x>rightPlayer.position.x ?enemySpeed * 2: energy>1000 ? enemySpeed : enemySpeed/2;

            rightPlayer.dx = Math.max(-speed, Math.min(speed, dx/3));
            if(rightPlayer.grounded
                && (Math.abs(ball.position.x-rightPlayer.position.x)>150
                || rightPlayer.position.x < ball.position.x)
                && Math.random()<.01
            ) {
                rightPlayer.dy = 8;
            }
        } else {
            var goal;
            var phaseShift = Math.sin(((time+133)/2000|0)*113) * 300;
            if(ball.position.x > 0) {
                goal = ball.position;
            } else if(leftPlayer.position.x > -300) {
                gg.x = -leftPlayer.position.x + phaseShift;
                gg.y = leftPlayer.position.y+5;
                goal = gg;
            } else {
                goal = orgPos;
            }
            var dx = (goal.x + phaseShift) - rightPlayer.position.x;
            var dy = goal.y - rightPlayer.position.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            energy -= dist/10;
            energy+=5;
            energy = Math.max(0,Math.min(10000,energy));

            var speed = energy>1000 ? enemySpeed : enemySpeed/2;

            rightPlayer.dx = Math.max(-speed, Math.min(speed, dx/3));
            rightPlayer.dy = Math.max(-speed, Math.min(speed, dy/3));

        }

    }

    var leftMat = {
        still: [ 0,1,2,3 ].map(function(num) {
            return 'img/monk-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        move: [ 4,5,6,7,8,9 ].map(function(num) {
            return 'img/monk-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        jump: [ 10,11,12 ].map(function(num) {
            return 'img/monk-00'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        kick: [ 13,14 ].map(function(num) {
            return 'img/monk-00'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        slide: [15].map(function(num) {
            return 'img/monk-00'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),
    };

    var rockMat = {
        still: [ 0 ].map(function(num) {
            return 'img/rock-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        move: [ 1,2,3,4 ].map(function(num) {
            return 'img/rock-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        jump: [ 1 ].map(function(num) {
            return 'img/rock-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),
    };

    var girlMat = {
        still: [ 0 ].map(function(num) {
            return 'img/girl-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        move: [ 1,2,3,4 ].map(function(num) {
            return 'img/girl-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        jump: [ 6 ].map(function(num) {
            return 'img/girl-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),

        kick: [ 7 ].map(function(num) {
            return 'img/girl-000'+num+'.png';
        }).map(function(file) {
            return THREE.ImageUtils.loadTexture(file);
        }).map(function(map) {
            return new THREE.MeshBasicMaterial({
                map:map,
                transparent:true,
                side: THREE.DoubleSide,
            });
        }),
    };

    function animate(monk, time) {
        var action =
            monk.slide && time-monk.slide < 400
            ?'slide'
            :monk.kick && time-monk.kick < 300
            ?'kick'
            :monk.inAir
            ?'jump'
            :Math.abs(monk.dx)<=0.3
            ?'still'
            :'move';
        var cycle = leftMat[action];
        var index = action==='still'
            ?(time/200|0)%cycle.length
            :action==='move'
            ?(time/20|0)%cycle.length
            :action==='jump'
            ?Math.min((time-monk.inAir)/100|0, cycle.length-1)
            :action==='kick'
            ?Math.min((time-monk.kick)/100|0, cycle.length-1)
            :action==='slide'
            ?0:0;
        ;
        monk.material = cycle[index];
        monk.scale.x = monk.lastDx<0?-1:1;
    }

    function animateRight(rock, time) {
        var action = Math.abs(rock.dx)>.2 ? 'move': 'still';
        var cycle = rockMat[action];
        var index = (time/100|0)%cycle.length;
        rock.material = cycle[index];
        rock.scale.x = Math.abs(rock.dx)<.1?1:rock.dx>0?-1:1;
    }

    function animateGirl(girl, time) {
        var action = girl.kick && time-girl.kick < 300 ?
            'kick' :
            !girl.grounded ? 'jump' :
                Math.abs(girl.dx)>.2 ? 'move': 'still';
        var cycle = girlMat[action];
        var index = (time/100|0)%cycle.length;
        girl.material = cycle[index];
        girl.scale.x = Math.abs(girl.dx)<.1?1: girl.dx>0?-1:1;

    }

    var changingScene = false;
    var keyboard = setupKeyboard();
    window.k = keyboard;
    function loop(time) {
        coreTime = time;
        animate(leftPlayer, time);
        animateGirl(girl,time);
        animateRight(rock, time);
        if(gameOver()) {
        } else if(time - started > headStart) {
            checkKeyboard(keyboard, time);
            moveToBall(rock,time,leftPlayer);
            moveToBall(girl,time,leftPlayer);
            checkShots(time);
        }
        leftPlayer.move();
        rock.move();
        girl.move();
        ball.move();
        if(!gameOver())
            updateTimer(time);
        else {
            updateScore(0,0);
            if(time - started - headStart > 60000 + 10000) {
                if(!changingScene) {
                    changingScene = true;
                    location.replace('score.html#' + scoreLeft+","+scoreRight);
                }
            }
        }
        requestAnimationFrame( loop );
        renderer.render(scene,camera);
    }
    loop(0);

    var lastCount = 0;
    function updateTimer(time) {
        var ellapsed = time-started-headStart;
        if(ellapsed>0) {
            topBar.scale.x = (60000-ellapsed)/60000;
        } else {
            var count = Math.round(-ellapsed/1000);
            if(lastCount != count) {
                new Audio(count===0 ? 'snd/start.ogg':'snd/countdown.ogg').play();
                lastCount = count;
            }
            document.getElementById('score').innerText = count>0?count:'';
        }
    }


    function start() {
        started = coreTime;
    }


    start();
};