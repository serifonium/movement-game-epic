import { consoleOpen } from "./console.js";
import {player} from "./player.js"

var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d");
var ctx2 = canvas.getContext("2d");
ctx.textAlign = "center";
ctx.font = "Arial 10px";
var keys = {}
var hoverVector = v(0, 0)
var recentShots = []
var hover = v(0, 0)
var scaleFactor = 1/2

var objects = [
    
]

function setScaleFactor(n) {
    scaleFactor = n
}
function zoomScaleFactor(direction) {
    let factor = 1.02
    if(direction=="=") {
        scaleFactor *= factor
    } else if(direction=="-") {
        scaleFactor *= 1/factor
    }
}
function updateHoverVector() {
    hoverVector = v(hover.x/scaleFactor+untrs('x'), hover.y/scaleFactor+untrs('y'))
}


function untrs(d) {
    if(d=="x"){
        return -(-(player.pos.x+player.scale.x/2)+window.innerWidth/(2*scaleFactor))
    } else {
        return -(-(player.pos.y+player.scale.y/4)+window.innerHeight/(2*scaleFactor))
    }
}
function playerCollisionExclusion(obj) {
    
    //return (!(obj instanceof Enemy) && !(obj instanceof Trigger) && !(obj instanceof Bullet) && !(obj instanceof NoCollisionHitbox) && !(obj instanceof Explosion) && !(obj instanceof ShotgunPellet)) || (obj instanceof Hitbox)
    if(obj.collision == true) {return true}
    else {return false}
}
function checkObjsOverlap(a) {
    let objs = []
    for(let obj of objects) {
      if(overlap(a, obj)) objs.push(obj)
    }
    return objs
  }




window.addEventListener('mousemove', (e) => {
    hover.x = e.pageX;     
    hover.y = e.pageY;
    updateHoverVector()
})

export {
    ctx, canvas, objects, keys, hoverVector, recentShots, untrs, hover, playerCollisionExclusion, checkObjsOverlap, scaleFactor, zoomScaleFactor,
    updateHoverVector
}