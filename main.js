var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d");
var ctx2 = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.font = "Arial 10px";

var DebugRender = true

var hover = v(0, 0)
var keys = {}
var lastkey = undefined 
document.addEventListener('keydown', (e)=>{
    keys[e.key.toLowerCase()]=true
    lastkey = e.key.toLowerCase()
})
document.addEventListener('keyup', (e)=>{
    keys[e.key.toLowerCase()]=false
})
window.addEventListener('mousemove', (e) => {
    hover.x = e.pageX / scaleFactor;     
    hover.y = e.pageY / scaleFactor;
})
class Hitbox {
    constructor(pos, scale){
        this.pos = pos
        this.scale = scale
    }
}
class Enemy {
    constructor(pos, scale){
        this.pos = pos
        this.vel = v(0, 0)
        this.scale = scale
        this.health = 50
        this.speed = 8
        this.acceldiv = 16
        this.accelrand = (e) => {
            return Math.random()/e+(e-1)/e
        }
        this.update = (e) => {
            this.accel = (d, p) => {
                if(d == 'x') {
                    if(p == '+') {
                        if(this.vel.x < this.speed) {
                            this.vel.x += this.speed/this.acceldiv*this.accelrand(3)
                        }
                    } else {
                        //console.log(this.vel.x , this.speed)
                        if(this.vel.x > -this.speed) {
                            
                            this.vel.x += -this.speed/this.acceldiv
                        }
                    }
                }
                if(d == 'y') {
                    if(p == '+') {
                        if(this.vel.y < this.speed) {
                            this.vel.y += this.speed/this.acceldiv
                        }
                    } else {
                        if(this.vel.y > -this.speed) {
                            this.vel.y += -this.speed/this.acceldiv
                        }
                    }
                }
            }
            if(this.health > 0) {
                if(player.pos.x > this.pos.x) {
                    this.accel('x','+')
                    //this.vel.x = this.speed
                } else if(player.pos.x < this.pos.x) {
                    this.accel('x','-')
                } else {
                    this.vel.x = 0
                } if(player.pos.y > this.pos.y) {
                    this.accel('y','+')
                } else if(player.pos.y < this.pos.y) {
                    this.accel('y','-')
                } else {
                    this.vel.y = 0
                }
            } else {
                this.vel.y = 0
                this.vel.x = 0
                this.pos.x = Infinity
            }
        }
    }
} 
class Bullet {
    constructor(pos, scale, vel){
        this.pos = pos
        this.vel = vel
        this.scale = scale
    }
}
class Trigger {
    constructor(pos, scale, onPlayerCollision){
        this.pos = pos
        this.scale = scale
        this.onPlayerCollision = onPlayerCollision
    }
}

class World {
    constructor(){
        this.objects = []
    }
    loadWorld() {
        objects = this.objects
    }
}

var player = {
    pos: v(499, 499),
    vel: v(0, 0),
    scale: v(50, 100),
    stam: 3,
    onGround: true,
    speed: 8,
}
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
    new Hitbox(v(1500, 0), v(50, 50)),
    new Trigger(v(1000, 0), v(50, 600)),
]
var debugAnglePoints = []
var recentShot = [v(0, 0), v(50, 50)]
var recentShots = []
var recentShotLen = 0
var scaleFactor = 1/2

function untrs(d) {
    if(d=="x"){
        return -(-player.pos.x+window.innerWidth/(2*scaleFactor))
    } else {
        return -(-player.pos.y+window.innerHeight/(2*scaleFactor))
    }
}

function render() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-player.pos.x+window.innerWidth/(2*scaleFactor), -player.pos.y+window.innerHeight/(2*scaleFactor));
    
    if(slamActive) ctx.fillStyle = "#00ff00"
    else ctx.fillStyle = "#0000ff"
    ctx.fillRect(untrs('x'), untrs('y'), 50, 50)
    if(player.onGround) ctx.fillStyle = "#00ff00"
    else ctx.fillStyle = "#0000ff"
    ctx.fillRect(60+untrs('x'), untrs('y'), 50, 50)
    ctx.fillStyle = "#00aaff"
    ctx.fillRect(player.pos.x, player.pos.y, player.scale.x, player.scale.y)
    ctx.fillText(`${player.vel.x} ${player.vel.y}`,60+untrs('x'), 60+untrs('y'))
    for(obj of objects) {
        ctx.fillStyle = "#000000"
        if(obj instanceof Trigger) {
            ctx.strokeStyle = "#ff00ff"
            ctx.beginPath();
            ctx.lineWidth = 4
            ctx.rect(obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
            ctx.stroke();
            ctx.strokeStyle = "#000000"
            ctx.lineWidth = 1
        } else {
            if(obj instanceof Enemy) {ctx.fillStyle = "#ff0000"}
            if(obj instanceof Bullet) {ctx.fillStyle = "#ffff00"}
            ctx.fillRect(obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
        }
    }
    ctx.fillStyle = "#ff0000"
    ctx.fillText(`${hover.x} ${hover.y}, ${getAngle(
        v(player.pos.x+25, player.pos.y+25), v(hover.x+untrs('x'), hover.y+untrs('y'))
        )}`,hover.x+untrs('x')+5,hover.y+untrs('y')-5)
    ctx.beginPath();
    ctx.arc(hover.x+untrs('x'), hover.y+untrs('y'), 5, 0, Math.PI*2)
    ctx.fill();

    ctx.font = "Arial 20px";
    ctx.fillText(`${player.stam}`,untrs('x')+50,untrs('y')+100)
    ctx.font = "Arial 10px";

    ctx.fillStyle = "#00ddff"
    ctx.fillRect(untrs('x')+window.innerWidth/(2*scaleFactor)-50, untrs('y')+window.innerHeight/scaleFactor-75, 50*player.stam, 20)
    ctx.fillRect(0, 0, 1000, 1)
    ctx.fillStyle = "#00dd00"
    for(let i =0; i < dashChain; i++) {
        ctx.fillRect(untrs('x')+window.innerWidth/(2*scaleFactor)-50+i*25+2.5, untrs('y')+window.innerHeight/scaleFactor-75, 20, 4)
    } 
    ctx.fillStyle = "#dd0000"
    for(let i =0; i < slamHeight; i++) {
        ctx.fillRect(untrs('x')+window.innerWidth/(2*scaleFactor)-50+i*25+2.5, untrs('y')+window.innerHeight/scaleFactor-75+16, 20, 4)
    }

    
    ctx.fillStyle = "#ff0000"

    ctx.beginPath();
    ctx.arc(player.pos.x+25, player.pos.y+25, 5, 0, Math.PI*2)
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(player.pos.x+25, player.pos.y+25);
    ctx.lineTo(hover.x+untrs('x'), hover.y+untrs('y'));
    ctx.stroke();
    /*
    ctx.beginPath();
    ctx.strokeStyle = "#00ddff"
    ctx.lineWidth = 15
    ctx.globalAlpha = recentShotLen/1000
    ctx.moveTo(recentShot[0].x, recentShot[0].y);
    ctx.lineTo(recentShot[1].x, recentShot[1].y);
    ctx.stroke();
    ctx.globalAlpha = 0
    */

    for(let i of recentShots) {
        ctx.beginPath();
        ctx.strokeStyle = "#00ddff"
        ctx.lineWidth = 15
        ctx.globalAlpha = i[2]/333
        ctx.moveTo(i[0].x, i[0].y);
        ctx.lineTo(i[1].x, i[1].y);
        ctx.stroke();
        ctx.globalAlpha = 0
    }
    
    for(i of debugAnglePoints) {
        ctx.beginPath();
        ctx.arc(i.x, i.y, 5, 0, Math.PI*2)
        ctx.fill();
    }
    



    ctx.fillStyle = "#ff0000"

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
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

var playerCollisionExclusion = (obj) => {
    return !(obj instanceof Enemy) && !(obj instanceof Trigger)
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
        debugAnglePoints.push(nearestpoint.pos)
        recentShots.push( [playerpoint, nearestpoint.pos, 333] )
        if(nearestpoint.obj.health != undefined) {
            nearestpoint.obj.health += -5 
        }
    } else {
        let farpoint = v(0, 0)
        farpoint.x = playerpoint.x+Math.sin((angle+180) * Math.PI/180) * bulletMaxLen
        farpoint.y = playerpoint.y+Math.cos((angle+180) * Math.PI/180) * bulletMaxLen
        console.log(farpoint)
        recentShots.push( [playerpoint, farpoint, 333] )
    }


   
}

window.addEventListener('mousedown', (e) => {
    shoot()
})

