//import { MultiplayerController } from "./multiplayer.js";

var multiplayerController = new MultiplayerController()

setTimeout(() => {
    multiplayerController.init()
}, 1000);

var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d");
var ctx2 = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.font = "Arial 10px";

var DebugRender = true

var hover = v(0, 0)
var keys = {}
var lastkey = undefined 
var tooltip = ""
document.addEventListener('keydown', (e)=>{
    keys[e.key.toLowerCase()]=true
    lastkey = e.key.toLowerCase()
    if(consoleOpen) {
        //console.log(e.key)
        if(e.key=="Backspace") {consoleLine=consoleLine.substring(0, consoleLine.length-1)}
        else if(e.key=="Space") consoleLine += " "
        else if(e.key=="Shift") {}
        else if(e.key=="Enter") {}
        else if(e.key=="Meta") {}
        else if(e.key=="Alt") {}
        else if(e.key=="Control") {}
        else if(e.key=="ArrowUp") {if(consoleHistory[consoleHistory.length-1]){consoleLine = consoleHistory[consoleHistory.length-1]}}
        else if(e.key=="ArrowDown") {}
        else if(e.key=="ArrowLeft") {}
        else if(e.key=="ArrowRight") {}
        else consoleLine += e.key
    }
})
var rightClickDown = false
function onRightClick() {
    //console.log("epic")
    //player.throwCoin()
    rightClickDown = true
}
document.addEventListener('keyup', (e)=>{
    keys[e.key.toLowerCase()]=false
})
window.addEventListener('mousemove', (e) => {
    hover.x = e.pageX / scaleFactor;     
    hover.y = e.pageY / scaleFactor;
    hoverVector = v(hover.x+untrs('x'), hover.y+untrs('y'))
})


var player = new Player()

var objects = [
    new Hitbox(v(-800, 600), v(6400, 50)),
    new Hitbox(v(900, 200), v(50, 50)),
    new Hitbox(v(300, 75), v(50, 50)),
    new Hitbox(v(400, 125), v(50, 50)),
    new Hitbox(v(800, 400), v(50, 50)),
    new Hitbox(v(5600, 100), v(50, 500)),
    new Hitbox(v(5200, -400), v(50, 500)),
    new Hitbox(v(5600, 100), v(2400, 50)),
    //new Enemy(v(0, 0), v(50, 50)),
    //new Enemy(v(200, 0), v(50, 50)),
    /*
    new Drone(v(100, 0)),
    new Drone(v(400, 0)),
    new Drone(v(800, 0)),
    new Drone(v(1000, 0)),
    
    new Husk(v(1000, 500)),
    */
    
    new Virtue(v(-500, 400)),
    new Hitbox(v(1500, 0), v(50, 50)),
    new Trigger(v(1000, 0), v(50, 600), () => {
        console.log("HIT")
        objects.push(
            new Drone(v(100, -1000)),
            new Drone(v(400, -1000)),
            new Drone(v(800, -1000)),
            new Drone(v(1000, -1000)),
            new Drone(v(100, -2000)),
            new Drone(v(400, -2000)),
            new Drone(v(800, -2000)),
            new Drone(v(1000, -2000)),
        )
    }),
]
//tutorial.loadWorld()
grind.loadWorld()
var debugAnglePoints = []
var recentShot = [v(0, 0), v(50, 50)]
var recentShots = []
var recentShotLen = 0
var scaleFactor = 1/2

function untrs(d) {
    if(d=="x"){
        return -(-(player.pos.x+player.scale.x/2)+window.innerWidth/(2*scaleFactor))
    } else {
        return -(-(player.pos.y+player.scale.y/4)+window.innerHeight/(2*scaleFactor))
    }
}

function render() {
    function translate() {
        ctx.translate(-(player.pos.x+player.scale.x/2)+window.innerWidth/(2*scaleFactor), -(player.pos.y+player.scale.y/4)+window.innerHeight/(2*scaleFactor));
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    ctx.scale(scaleFactor, scaleFactor);


    
    ctx.beginPath();
    ctx.arc(hover.x, hover.y, 5, 0, Math.PI*2)
    ctx.fill();


    translate()
    
    player.render()
    
    
    for(obj of objects) {
        ctx.fillStyle = "#ffffff"
        if(obj instanceof Trigger) {
            /*
            ctx.strokeStyle = "#ff00ff"
            ctx.beginPath();
            ctx.lineWidth = 4
            ctx.rect(obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
            ctx.stroke();
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 1
            */
        } else {
            if(obj instanceof Enemy) {ctx.fillStyle = "#ff0000"}
            if(obj instanceof Bullet) {obj.force instanceof Enemy? ctx.fillStyle = "#f20" : ctx.fillStyle = "#0af"}
            ctx.strokeStyle = ctx.fillStyle
            ctx.lineWidth = 2
            if(obj.render) {
                obj.render()
            } else {
                ctx.fillRect(obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
            }
        }
    }
    

 
    

    
    ctx.fillStyle = "#ff0000"

    ctx.beginPath();
    ctx.arc(player.pos.x+25, player.pos.y+25, 5, 0, Math.PI*2)
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(player.pos.x+25, player.pos.y+25);
    ctx.lineTo(hover.x+untrs('x'), hover.y+untrs('y'));
    ctx.stroke();

    for(let i of recentShots) {
        ctx.beginPath();
        ctx.strokeStyle = "#00ddff"
        ctx.lineWidth = 15
        ctx.globalAlpha = i[2]/333
        ctx.moveTo(i[0].x, i[0].y);
        ctx.lineTo(i[1].x, i[1].y);
        ctx.stroke();
        ctx.globalAlpha = 1
    }
    
    ctx.fillStyle = "#f60"
    for(i of debugAnglePoints) {
        ctx.beginPath();
        ctx.arc(i.x, i.y, 5, 0, Math.PI*2)
        ctx.fill();
    }
    

    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 2
    ctx.beginPath();
    //ctx.arc(player.pos.x+player.scale.x/2, player.pos.y+player.scale.y/4, 600, 0, Math.PI*2)
    ctx.stroke();


    for(obj of objects) {
        if(obj.vel && obj.middle) {
            ctx.strokeStyle = "#fff"
            ctx.fillStyle = "#fff"
            ctx.beginPath()
            /*
            ctx.moveTo(obj.middle.x, obj.middle.y)
            ctx.lineTo(obj.middle.x+obj.vel.x*50, obj.middle.y+obj.vel.y*50)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(obj.middle.x+obj.vel.x*50, obj.middle.y+obj.vel.y*50, 4, 0, Math.PI*2)
            ctx.fill()
            */
        }
    }
    

    ctx.fillStyle = "#ff0000"



    ctx.setTransform(1, 0, 0, 1, 0, 0);



    ctx.fillStyle = "#06a"
    ctx.fillRect(window.innerWidth/2-50-player.scale.x/2, window.innerHeight-75, 150, 25)
    ctx.fillStyle = "#0df"
    ctx.fillRect(window.innerWidth/2-50-player.scale.x/2, window.innerHeight-75, 50*player.stam, 25)
    ctx.fillStyle = "#700"
    ctx.fillRect(window.innerWidth/2-50-player.scale.x/2, window.innerHeight-125, 150, 25)
    ctx.fillStyle = "#0f0"
    ctx.fillRect(window.innerWidth/2-50-player.scale.x/2, window.innerHeight-125, 1.5*player.health, 25)
    ctx.fillStyle = "#400"
    ctx.fillRect(window.innerWidth/2-50-player.scale.x/2, window.innerHeight-100, 150, 25)
    ctx.fillStyle = "#f70"
    ctx.fillRect(window.innerWidth/2-50-player.scale.x/2, window.innerHeight-100, 1.5*player.fuel, 25)
    ctx.font = "25px Arial"
    ctx.fillText(Math.floor(player.style), window.innerWidth/2+150-player.scale.x/2, window.innerHeight-100)
    ctx.font = "10px Arial"
    
   
    //dctx.fillRect(borders.min, 64, borders.max-borders.min, 64)
    renderWeaponIcons()

    renderStyle() 

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff"
    ctx.font = "25px Arial";
    ctx.fillText(tooltip, window.innerWidth/2, window.innerHeight-225)
    ctx.textAlign = "left";
    if(!player.alive) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#600"
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.fillStyle = "#fff"
        ctx.font = "145px Arial"
        ctx.fillText("Perished", window.innerWidth/2, window.innerHeight/2)
        ctx.font = "10px Arial"
        ctx.textAlign = "left";
    }
    

    if(consoleOpen) {
        ctx.globalAlpha = 0.3
        ctx.fillStyle = "#aaa"
        ctx.fillRect(0, window.innerHeight-100, window.innerWidth, 100)
        ctx.globalAlpha = 1
        ctx.fillStyle = "#fff"
        ctx.font = "25px Arial";
        renderText(consoleLine, v(10, window.innerHeight-100), undefined, 0.5)
        //ctx.fillText(consoleLine, 10, window.innerHeight-10)
        for(let line in consoleHistory) {
            renderText(consoleHistory[line], v(10, window.innerHeight-150-line*20), undefined, 0.25)
            //ctx.fillText(consoleHistory[line],  10, window.innerHeight-110-line*30)
        }
        ctx.font = "10px Arial";
    }
    
    
}
setInterval(render, 1000/60)
var slamActive = false
var slamCooldown = 0
var slamHeight = 0
var dashCooldown = 0
var dashChain = 0
var jumpCooldown = 0
const bulletMaxLen = 2000
var tick = Date.now()
var lastTick = Date.now()
var consoleOpen = false
var consoleLine = "/"
var consoleHistory = []

var playerCollisionExclusion = (obj) => {
    return (!(obj instanceof Enemy) && !(obj instanceof Trigger) && !(obj instanceof Bullet) && !(obj instanceof NoCollisionHitbox) && !(obj instanceof Explosion) && !(obj instanceof ShotgunPellet)) || (obj instanceof Hitbox)
}



function shoot() {
    let objs = []
    for(let o of objects) {
        if(!(o instanceof Trigger)) objs.push(o)
    }
    
    let v1 = v(player.pos.x+25, player.pos.y+25)
    let v2 = v(hover.x+untrs('x'), hover.y+untrs('y'))
    let angle = getAngle(v1, v2)
    let gradient = undefined
    let offset = undefined
    gradient = -(v2.y-v1.y)/(v2.x-v1.x)
    offset = gradient*v1.x+v1.y
    
    
    let nearestpointscandidates = []
    let nearestpoint = null
    let playerpoint = {x:player.pos.x+25, y:player.pos.y+25}
    for (let obj of objs) {
        let points = []
        let mainfunc = getFunction(v1, v2)
        /*
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y)) )) 
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)) )) 
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y+obj.scale.y)) )) 
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y)) )) 
        */
        points.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y)), mainfunc )) 
        points.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)), mainfunc )) 
        points.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y+obj.scale.y)), mainfunc )) 
        points.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y)), mainfunc )) 

        let objpoints = []
        for(p of points) {
            if(overlapping(p.x, p.y, 1, 1, obj.pos.x-1, obj.pos.y-1, obj.scale.x+2, obj.scale.y+2)) {
                objpoints.push(p)
            }
        }
        if(objpoints.length!=0) {
            let closestPoint = null
            for(r of objpoints) {
                if(closestPoint != null) {
                    if(getDistance(playerpoint, r) < getDistance(playerpoint, closestPoint)) {
                        closestPoint = r
                    }
                } else {
                    closestPoint = r
                }  
            }
            nearestpointscandidates.push({obj:obj, pos:closestPoint})
        }
    }
    let nearestpoints = []
    for(let e of nearestpointscandidates) {
        if (getDistance(playerpoint, e.pos) < bulletMaxLen) {
            if(angle > 0) {
                if(e.pos.x < playerpoint.x) {
                    nearestpoints.push(e)
                }
            } if(angle < 0) {
                if(e.pos.x > playerpoint.x) {
                    nearestpoints.push(e)
                }
            }
        }
    }
    for(let e of nearestpoints) {
        //debugAnglePoints.push(e.pos)
        if(nearestpoint != null) {
            
            if(getDistance(playerpoint, e.pos) < getDistance(playerpoint, nearestpoint.pos)) {
                nearestpoint = e
            }
        } else {
            nearestpoint = e
        }  
    }

    if(nearestpoint != null) {
        //console.log(nearestpoint.obj)
        //debugAnglePoints.push(nearestpoint.pos)
        let distance = getDistance(nearestpoint.obj.pos, player.middle)
        recentShots.push( [playerpoint, nearestpoint.pos, 333] )
        if(nearestpoint.obj.health != undefined) {
            nearestpoint.obj.damage(12.5)
        }
        if(nearestpoint.obj instanceof Bullet) {
            nearestpoint.obj.force = player
            let a = fetchAngle(nearestpoint.obj.pos, player.middle)
            nearestpoint.obj.vel.x = -Math.cos(a)
            nearestpoint.obj.vel.y = -Math.sin(a)
        }
        if(nearestpoint.obj instanceof Coin) {
            objects.push(new Explosion(nearestpoint.obj.middle, Math.sqrt(distance*250), {force:10, dmg:30}))
            objects[objects.length-1].explode()
            let a = fetchAngle(nearestpoint.obj.pos, player.middle)
            let force = 10
            //nearestpoint.obj.vel.x += -Math.cos(a) * force
            //nearestpoint.obj.vel.y += -Math.sin(a) * force * 2
        }
    } else {
        let farpoint = v(0, 0)
        farpoint.x = playerpoint.x+Math.sin((angle+180) * Math.PI/180) * bulletMaxLen
        farpoint.y = playerpoint.y+Math.cos((angle+180) * Math.PI/180) * bulletMaxLen
        //console.log(farpoint)
        recentShots.push( [playerpoint, farpoint, 333] )
    }


   
}
var shootDel = false
window.addEventListener('mousedown', (e) => {
    if(detectLeftButton(e)) {
        //shoot();
        player.weaponSelected.primaryFire()
    } else {
        player.weaponSelected.secondaryFire()
    }
    
    
    console.log()
    //Weapons[player.weaponIndex].primaryFire()
    //fetchAngle(player.middle, hoverVector)
    //console.log(hover)
    if(!player.alive) {
        player = new Player()
    }
})
window.addEventListener('mouseup', (e) => {
    rightClickDown = false
})


function detectLeftButton(evt) {
    evt = evt || window.event;
    if ("buttons" in evt) {
        return evt.buttons == 1;
    }
    var button = evt.which || evt.button;
    return button == 1;
}


/*
var thing = 0
var thing2 = []
while (true) {
  thing++ 
    thing2.push(thing)
}*/