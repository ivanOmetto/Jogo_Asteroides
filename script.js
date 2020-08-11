const showBounding = false; // show or hide collision bounding
const showCenterDot = false; // show or hide the red dot of the player
const FPS = 30; // Frames per second, default 30
const friction = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of fricition), default 0.7
const shipSize = 30; // Ship height in pixels, default 30
const shipThrust = 5; // Acceleration of the ship in pixels per second, default 5
const turnSpeed = 360; // turn speed degrees per second, default 360
const roidsNum = 10; // starting number of asteroids, default 3
const roidsSpd = 50; // max starting speed of asteroids in PXs, default 50
const roidsSize = 100; // starting size of asteroids in px, default 100
const roidsVert = 10; // average number of vertices on each asteroid, default 10
const roidsJag = 0.4; // jaggedness of the asteroids (0 = none, 1 = lots), default 0.4
const shipExplodeDur = 0.3; // duration of the ship explosion, default 0.3
const shipInvDur = 3; // duration of the invencibility of the ship in second, default 3
const shipBlinkDur = 0.1; // duration of the ship's blink invencibility, default 0.1
const laserMax = 10; // maximun number of lasers on screen at once, default = 10
const laserSpd = 500; // speed of laser in PXs, default = 500
const laserDist = 0.2; // max distance larser can travel as fraction of screen width, default = 0.6
 

/** @type {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

// set up spaceship object
var ship = newShip();

// set up asteroids
var roids = [];
createAsteroidBelt();

// Set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", KeyUp);

// Set up the game loop
setInterval(update, 1000 / FPS); // 30 fps / 1000 (update screan)

function createAsteroidBelt(){
    roids = [];
    var x, y;
    for (var i = 0; i < roidsNum; i++){
        do {
        x = Math.floor(Math.random() * canv.width);
        y = Math.floor(Math.random() * canv.height);
        } while(distBetweenPoints(ship.x, ship.y, x, y) < roidsSize * 2 + ship.r);
        roids.push(newAsteroid(x, y));
       
    }
}

function distBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1 , 2));
}

function explodeShip(){
    ship.explodeTime = Math.ceil(shipExplodeDur * FPS);
}

function keyDown(/** @type {keyBoardEvent} */ ev){
    switch(ev.keyCode) {
        case 37: // left arrow (rotate ship left)
            ship.rot = turnSpeed / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (forward)
            ship.thrusting = true;
            break;
        case 39: // right arrow (rotate ship right)
            ship.rot = - turnSpeed / 180 * Math.PI / FPS;
            break;
        case 32: // spce bar (shoot laser)
            shootLaser();
            break;
    }
}

function KeyUp(/** @type {keyBoardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // left arrow (stop rotating left)
            ship.rot = 0;
            break;
        case 38: // up arrow (stop forward)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotating right)
            ship.rot = 0;
            break;
        case 32: // spce bar (allow shooting again)
            ship.canShoot = true;
            break;
    }
}

function newAsteroid(x, y){
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * roidsSpd / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * roidsSpd / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: roidsSize / 2,
        a: Math.random() * Math.PI * 2, // in radians
        vert: Math.floor(Math.random() * (roidsVert + 1) + roidsVert / 2),
        offs: []
    };

    // create the vertex offets array
    for (var i = 0; i < roid.vert; i++){
        roid.offs.push(Math.random() * roidsJag * 2 + 1 - roidsJag);
    }

    return roid;
}

function newShip(){
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: shipSize / 2,
        a: 90 / 180 * Math.PI, // Convert to radians
        blinkTime: Math.ceil(shipBlinkDur * FPS),
        blinkNum: Math.ceil(shipInvDur / shipBlinkDur),
        canShoot: true,
        lasers: [],
        explodeTime: 0,
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser(){
    // create the laser object
    if(ship.canShoot && ship.lasers.length < laserMax){
        ship.lasers.push({ // fron the nose of ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laserSpd * Math.cos(ship.a) / FPS,
            yv: -laserSpd * Math.sin(ship.a) / FPS,
            dist: 0
        })
    }
    ship.canShoot = false;
}

function update(){
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;

    // Draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // thrust the ship
    if(ship.thrusting) {
        ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;

        // draw the thuster
        if(!exploding && blinkOn){
            ctx.fillStyle = "red"
            ctx.strokeStyle = "orange";
            ctx.lineWidth = shipSize / 10;
            ctx.beginPath();
            ctx.moveTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo( // Rear center behind
                ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo( // Rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }else{
        ship.thrust.x -= friction * ship.thrust.x / FPS
        ship.thrust.y -= friction * ship.thrust.y / FPS;
    }
    
    // Draw ship
    if(!exploding){
        if(blinkOn){
            ctx.strokeStyle = "white";
            ctx.lineWidth = shipSize / 20;
            ctx.beginPath();
            ctx.moveTo( // Nose of the ship
                ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
            );
            ctx.lineTo( // Rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
            );
            ctx.lineTo( // Rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.stroke();

            if(showBounding){
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
        }

        //handle blinking
        if(ship.blinkNum > 0){
            //reduce the blink time
            ship.blinkTime--;

            //reduce the blink num
            if(ship.blinkTime == 0){
                ship.blinkTime = Math.ceil(shipBlinkDur * FPS);
                ship.blinkNum--;
            }
        }
    } else{
        // draw the explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // draw the asteroids
    var x, y, r, a, vert, offs;
    for(var i = 0; i < roids.length; i++){
        ctx.strokeStyle = "slategray";
        ctx.lineWidth = shipSize / 20;

        // get the asteroid properties
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offs = roids[i].offs;

        // draw path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a),
        );

        // draw polygon
        for (var j = 1; j < vert; j++){
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        if(showBounding){
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    // draw the lasers
    for(var i = 0; i < ship.lasers.length; i++){
        ctx.fillStyle = "salmon";
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // check for asteroid collisions
    if(!exploding){
        if(ship.blinkNum == 0){
            for(var i = 0; i < roids.length; i++){
                if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r){
                    explodeShip();
                }
            }
        }

        // Rotate ship
        ship.a += ship.rot;

        // Move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    }else{
        ship.explodeTime--;

        if(ship.explodeTime == 0){
            ship = newShip();
        }
    }

    // handle edge of screan
    if(ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    }else if(ship.x > canv.width + ship.r){
        ship.x = 0 - ship.r;
    }

    if(ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    }else if(ship.y > canv.height + ship.r){
        ship.y = 0 - ship.r;
    }

    // move the asteroid
    for(var i = 0; i < roids.length; i++){
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;
            
        // handle edge of screen
        if(roids[i].x < 0 - roids[i].r){
            roids[i].x = canv.width + roids[i].r;
        }else if (roids[i].x > canv.width + roids[i].r){
            roids[i].x = 0 - roids[i].r;
        }

        if(roids[i].y < 0 - roids[i].r){
            roids[i].y = canv.height + roids[i].r;
        }else if(roids[i].y > canv.height + roids[i].r){
            roids[i].y = 0 - roids[i].r;
        }      
    }

    // move the lasers
    for(var i = ship.lasers.length - 1; i >= 0; i--){
        // check distance trevelled
        if(ship.lasers[i].dist > laserDist * canv.width){
            ship.lasers.splice(1, 1);
            continue;
        }

        // move the laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        // calculete the distance travelled
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        
        // handle edge of sceen
        if(ship.lasers[i].x < 0){
            ship.lasers[i].x = canv.width;
        }else if(ship.lasers[i].x > canv.width){
            ship.lasers[i].x = 0;
        }

        if(ship.lasers[i].y < 0){
            ship.lasers[i].y = canv.height;
        }else if(ship.lasers[i].y > canv.height){
            ship.lasers[i].y = 0;
        }
    }

    //center dot (for tests)
    if(showCenterDot){
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }
}