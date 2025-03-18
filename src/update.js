import {
    Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText,
    Trigger, GrindHandler, CombatText, PlatformHitbox
} from "./classes.js"
import {Weapons} from "./weapons.js"
import {objects, keys, recentShots, playerCollisionExclusion, scaleFactor, zoomScaleFactor, updateHoverVector} from "./startup.js"
import {player} from "./player.js"
import {consoleOpen, openConsole, consoleCommand, consoleLine, consoleHistory, addToConsoleHistory, resetConsoleLine} from "./console.js"
import { particleHandler } from "./particles.js"




var tick = Date.now()
var lastTick = Date.now()
const UPDATE_PER_SECONDS = 120
var GAME_SPEED = 1
var dT = 0

function getDeltaTime() {
    return Math.min(dT, 50)
    //return Math.min(((tick - lastTick)) * GAME_SPEED, 100)
}
function getVelTime() {
    return 1/UPDATE_PER_SECONDS
    //return Math.min(((tick - lastTick)) * GAME_SPEED, 100)
}

function update() {
    tick = Date.now()
    dT = tick - lastTick
    lastTick = Date.now()


    //console.log(getDeltaTime())
   
    for(let weapon of Weapons) {
        if(weapon.update)weapon.update()
    }

    for(let obj of objects) {
        if(obj.vel) {
            obj.pos.x += obj.vel.x*getDeltaTime()
            obj.pos.y += obj.vel.y*getDeltaTime()
        } if(obj.update) {
            obj.update(obj)
        }
    }
    for(let obj of objects) {
        if(overlapping(player.pos.x, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y) && obj instanceof Trigger) {
            //obj.onPlayerCollision()
        }
    }
    particleHandler.updateParticles(getDeltaTime()/(1000/60))
    if(player.stam < 3) {
        player.stam += 0.0018 * getDeltaTime()
    } else {
        player.stam = 3
    }
    if(player.vel.x < 0.2 && player.vel.x > -0.2) player.dashChain = 0
    function slam() {
        if(!player.slamActive && !player.onGround) {
            player.vel.y = 40
            player.slamCooldown = 100
            player.slamHeight += 1
            player.slamActive = true
        }
    }
    

    if(!consoleOpen) {
        if(keys["d"]) {
            
        }
        if(keys["a"]) {
            
            
        }
        if((keys[" "])) {
            
        }
        if(keys["shift"]) {
            
        }
        if(keys["control"]) {
            slam()
            keys["control"] = false
        }
        if(keys["="]) zoomScaleFactor("=")
        if(keys["-"]) zoomScaleFactor("-")
        if(keys["f"]) {
            player.punch()
            keys["f"] = false
        }
        if(keys["/"]) {
            openConsole()
        }
    } else {
        if(keys["enter"]) {
            openConsole(true)
            consoleCommand(consoleLine)
            addToConsoleHistory(consoleLine)
            resetConsoleLine()
        } if(keys["/"]) {
            openConsole(false)
        }
        
    }
    player.update()
    updateHoverVector()

    
    if(player.dashCooldown > 0) player.dashCooldown += -getDeltaTime()
    else player.dashCooldown = 0

    
    if(player.jumpCooldown > 0) player.jumpCooldown += -getDeltaTime()
    else player.jumpCooldown = 0

    //if(recentShotLen > 0) recentShotLen += -(tick - lastTick) * getDeltaTime()
    //else recentShotLen = 0

    for(let i of recentShots) {
        if(i[2] > 0) i[2] -= getDeltaTime()
        else i[2] = 0
    }

    if(player.onGround) {
        if(player.slamCooldown > 0) player.slamCooldown += -(tick - lastTick) * getDeltaTime()
        else { 
            player.slamCooldown = 0
            player.slamHeight = 0
        }
    }
    
}





export {getDeltaTime, getVelTime, update, UPDATE_PER_SECONDS}
