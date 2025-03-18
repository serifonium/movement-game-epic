import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox} from "./classes.js"
import {player, Player, playerRespawn} from "./player.js"
import {getDeltaTime, update, UPDATE_PER_SECONDS} from "./update.js"
import {Drone, Virtue, Idol, Watcher, Enemy, Bullet} from "./enemies.js"
import {ctx, canvas, objects, keys, hoverVector, recentShots, untrs, hover, scaleFactor, DebugRender} from "./startup.js"
import {grind} from "./maps.js"
import {Weapons} from "./weapons.js"
import {renderWeaponIcons, renderStyle, renderText} from "./render.js"
import {consoleOpen, consoleLine, consoleHistory, enterConsoleKey} from "./console.js"
import { particleHandler } from "./particles.js"
import { pauseMenu } from "./menu.js"
//import { MultiplayerController } from "./multiplayer.js";

//var multiplayerController = new MultiplayerController()

// setTimeout(() => {
//     multiplayerController.init()
// }, 1000);

//MAIN COLOURS:

//#ce376d
//#a22f60

var lastkey = undefined 
var tooltip = ""
document.addEventListener('keydown', (e)=>{
    keys[e.key.toLowerCase()]=true
    lastkey = e.key.toLowerCase()
    if(keys["q"]) { 
        console.log(overlap(pauseMenu.buttons[0], {pos:hover, scale:v(1)}))
        //console.log(pauseMenu.buttons[0].pos, hover)
        keys["q"] = false
    }
    if(pauseMenu.open) {
        if(keys["escape"]) {
            pauseMenu.closeMenu()
            keys["escape"] = false
        }
    } if(consoleOpen) {
        //console.log(e.key)
        enterConsoleKey(e.key)
    }
})
var rightClickDown = false

document.addEventListener('keyup', (e)=>{
    keys[e.key.toLowerCase()]=false
})







//tutorial.loadWorld()
grind.loadWorld()
var debugAnglePoints = []
var recentShot = [v(0, 0), v(50, 50)]

var recentShotLen = 0




function render() {
    function translate() {
        ctx.translate(-(player.pos.x+player.scale.x/2)+window.innerWidth/(2*scaleFactor), -(player.pos.y+player.scale.y/4)+window.innerHeight/(2*scaleFactor));
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

    ctx.scale(scaleFactor, scaleFactor);

    ctx.fillStyle = "#fff"
    
    ctx.beginPath();
    //ctx.arc(hover.x, hover.y, 5, 0, Math.PI*2)
    ctx.fill();


    translate()
    
    player.render()
    
    
    for(let obj of objects) {
        ctx.fillStyle = "#ffffff"
        if(obj instanceof Enemy) {ctx.fillStyle = "#ff0000"}
        if(obj instanceof Bullet) {obj.force instanceof Enemy? ctx.fillStyle = "#f20" : ctx.fillStyle = "#0af"}
        ctx.strokeStyle = ctx.fillStyle
        ctx.lineWidth = 2
        if(obj.render) {
            obj.render()
        } else {
            ctx.fillRect(obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
        }
        if(DebugRender && obj.scale && this.pos) {
            ctx.strokeStyle = "#3a9120"
            ctx.lineWidth = 8
            ctx.beginPath();
            ctx.rect(this.pos.x+4, this.pos.y+4, this.scale.x-8, this.scale.y-8)
            ctx.stroke()
        }
    }
    

 
    

    
    ctx.fillStyle = "#ff0000"

    ctx.beginPath();
    ctx.arc(player.pos.x+25, player.pos.y+25, 5, 0, Math.PI*2)
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(player.pos.x+25, player.pos.y+25);
    ctx.lineTo(hover.x/scaleFactor+untrs('x'), hover.y/scaleFactor+untrs('y'));
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

    ctx.fillStyle = "#ff0000"


    particleHandler.renderParticles()



    ctx.setTransform(1, 0, 0, 1, 0, 0);

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


    if(pauseMenu.open) {
        ctx.globalAlpha = 0.5
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.globalAlpha = 1
        pauseMenu.render(pauseMenu)
        pauseMenu.renderButtons(pauseMenu)
    }
    
    
}
setInterval(render, 1000/60)









var shootDel = false
window.addEventListener('mousedown', (e) => {
    if(detectLeftButton(e)) {
        //shoot();
        player.weaponSelected.primaryFire()
    } else {
        player.weaponSelected.secondaryFire()
    }
    
    
    //Weapons[player.weaponIndex].primaryFire()
    //fetchAngle(player.middle, hoverVector)
    //console.log(hover)
    if(!player.alive) {
        playerRespawn()
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















setInterval(()=>{
    if(pauseMenu.open) pauseMenu.update()
    else update()
}, 1000/UPDATE_PER_SECONDS)
