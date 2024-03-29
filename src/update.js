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
const UPDATE_PER_SECONDS = 60
var GAME_SPEED = 1

function getDeltaTime(type = false) {
    if(type) {
        return ((tick - lastTick)) * GAME_SPEED
    } else {
        return ((tick - lastTick) / (1000/UPDATE_PER_SECONDS)) * GAME_SPEED
    }
}

function update() {
    tick = Date.now()

   
    for(let weapon of Weapons) {
        if(weapon.update)weapon.update()
    }
    for(let obj of objects) {
        if(obj.vel) {
            obj.pos.x += obj.vel.x*getDeltaTime()/(1000/60)
            obj.pos.y += obj.vel.y*getDeltaTime()/(1000/60)
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
    
    if(player.noclip) {
        player.pos.x += player.vel.x * getDeltaTime()
        player.pos.y += player.vel.y * getDeltaTime()
    } else {
        let u = true
        for(let obj of objects) {
            if(overlapping(player.pos.x+player.vel.x, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
            && playerCollisionExclusion(obj)) {u = obj}
        }
        if(u==true) {
            player.pos.x += player.vel.x * getDeltaTime()
        } else {
            if(player.vel.x > 0) {
                player.pos.x = u.pos.x - player.scale.x - 0.1
                player.vel.x = 0
            }
            else if(player.vel.x < 0) {
                player.pos.x = u.pos.x + u.scale.x + 0.1
                player.vel.x = 0
            }
        }
        
        u = true
        for(let obj of objects) {
            if(overlapping(player.pos.x, player.pos.y+player.vel.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
            && playerCollisionExclusion(obj)) u = obj
        }
        if(u==true) {
            player.pos.y += player.vel.y * getDeltaTime()
        } else {
            if(player.vel.y > 0) {
                player.pos.y = u.pos.y - player.scale.y - 0.1
                player.onGround = true
            }
            else if(player.vel.y < 0) {
                player.pos.y = u.pos.y + u.scale.y + 0.1
                player.vel.y = 0
            }
        }
    }
    
    let u = true
    for(let obj of objects) {
        if(overlapping(player.pos.x, player.pos.y+1, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
        && playerCollisionExclusion(obj)) u = obj
    }
    if(u==true) {
        player.onGround = false
    }
    if(player.onGround == true) player.vel.y = 0

    if(!player.onGround) {
        if(player.vel.y < 30)player.vel.y += 1 * getDeltaTime()
    }
    if(player.onGround) {
        if(player.vel.x > 0){ 
            if(player.vel.x > player.speed) {
                player.vel.x = player.vel.x * Math.pow(0.94, getDeltaTime())
            } else {
                player.vel.x += -0.25 * getDeltaTime()
            }
        }
        if(player.vel.x < 0) {
            if(player.vel.x > player.speed) {
                player.vel.x = player.vel.x * Math.pow(0.94, getDeltaTime())
            } else {
                player.vel.x += 0.25 * getDeltaTime()
            }
        }
        if((player.vel.x <= 0.25 && player.vel.x >= -0.25) && (!keys['a'] && !keys['d'])) {
            player.vel.x = 0
        }
        player.slamActive = false
    }

    for(let obj of objects) {
        /*
        if(let obj instanceof Bullet) {
            if(overlapping(player.pos.x, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) {
                player.health += -5
                obj.pos.x = Infinity
            }
        }*/
    }

    function dash() {
        let dashMax = 42
        let dashSpeed = 22
        if(player.stam >= 1 && player.dashCooldown == 0) {
            player.stam += -1 * getDeltaTime()
            player.dashCooldown = 10
            player.dashChain += 1

            dashSpeed += player.dashChain*2
            //dashSpeed = (Math.log(dashChain)/Math.log(2))

            if(keys["d"]) {
                player.vel.x = dashSpeed
            }
            else if(keys["a"]) {
                player.vel.x = -dashSpeed
            }
        }
        /*
        ADD SPEED BOOST
        b=log{1.7}(a-27)
        y=-1.7^(x-b)+a
        x: num of dashes
        y=-1.7^(x-(log{1.7}(a-27)))+a
        */

    }
    if(player.stam < 3) {
        player.stam += 0.02 * getDeltaTime()
    } else {
        player.stam = 3
    }
    if(player.vel.x < 8 && player.vel.x > -8) player.dashChain = 0
    function slam() {
        if(!player.slamActive && !player.onGround) {
            player.vel.y = 40
            player.slamCooldown = 100
            player.slamHeight += 1
            player.slamActive = true
        }
    }
    function checkSides() {
        for(let obj of objects) {
            if(obj instanceof Hitbox && playerCollisionExclusion(obj)) {
                if(overlapping(player.pos.x+1, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) return "right"
                if(overlapping(player.pos.x-1, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) return "left"
            }
        }
        return false
    }

    if(!consoleOpen) {
        if(keys["d"]) {
            if(player.vel.x < player.speed) {
                player.vel.x += (player.speed/8) * getDeltaTime()
            }
        }
        if(keys["a"]) {
            if(player.vel.x > -player.speed) {
                player.vel.x += (-player.speed/8) * getDeltaTime()
            }
            
        }
        if((keys[" "])) {
            if(player.onGround) {
                if(player.slamCooldown > 0) { //REGULAR JUMPS
                    player.vel.y = -26 - player.slamHeight*2; 
                } else {
                    player.vel.y = -26; 
                }
                
                player.onGround = false
            } else { 
                if(checkSides()!=false){ //WALL JUMPS
                    if(checkSides() == "left") {
                        player.vel.x = player.speed*2; 
                        player.vel.y = -26; 
                    } else if(checkSides() == "right") {
                        player.vel.x = -player.speed*2; 
                        player.vel.y = -26; 
                    }
                }
                else if(player.stam >= 2 && player.jumpCooldown == 0) { //AIR JUMPS
                    player.stam += -2
                    player.jumpCooldown = 100
                    if(player.slamCooldown > 0) {
                        player.vel.y = -26; 
                    } else {
                        player.vel.y = -26; 
                    }
                }
            }
            keys[" "] = false
        }
        if(keys["shift"]) {
            dash()
            keys["shift"] = false
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
        }
    }
    player.update()
    updateHoverVector()

    
    if(player.dashCooldown > 0) player.dashCooldown += -(tick - lastTick) * getDeltaTime()
    else player.dashCooldown = 0

    
    if(player.jumpCooldown > 0) player.jumpCooldown += -(tick - lastTick) * getDeltaTime()
    else player.jumpCooldown = 0

    //if(recentShotLen > 0) recentShotLen += -(tick - lastTick) * getDeltaTime()
    //else recentShotLen = 0

    for(let i of recentShots) {
        if(i[2] > 0) i[2] += -(tick - lastTick) * getDeltaTime()
        else i[2] = 0
    }

    if(player.onGround) {
        if(player.slamCooldown > 0) player.slamCooldown += -(tick - lastTick) * getDeltaTime()
        else { 
            player.slamCooldown = 0
            player.slamHeight = 0
        }
    }
    lastTick = Date.now()
}





export {getDeltaTime, update, UPDATE_PER_SECONDS}
