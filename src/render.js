import {player} from "./player.js"
import {Piercer, Shotgun, RocketLauncher, Railgun} from "./weapons.js"
import {ctx, objects, scaleFactor} from "./startup.js"
import {styleStyles, uiOverlay} from "./image.js"
import {weaponStyles, redText, whiteText, ammoTypes} from "./image.js"
import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox} from "./classes.js"

function renderText(str, pos=v(0, 0), bounds=v(128,128), scale, type=redText) {
    let p = v(pos.x, pos.y)
    function renderKey(key, pos) {
        type.renderFromKeycodes(pos, key, v(scale, scale))
    }
    for (let i = 0; i < str.length; i++) {
        renderKey(str[i], p)
        p.x += 28*scale
    }
}

function getStyleThreshold() {
    for(let i in player.styleThresholds) {
        if(player.style < player.styleThresholds[i])
        return i-1
    }
    return 12
}
function getStyleInterval() {
    let t = getStyleThreshold()
    return player.style/player.styleThresholds[t+1]
}

function renderStyle() {
    
    
    let thresholds = player.styleThresholds
    let mPos = v(140, 4)
    ctx.fillStyle = "#fff"
    if(player.style < thresholds[0]) {}
    else if(player.style < thresholds[1]) styleStyles.render(mPos, v(0, 0), v(0.5, 0.5))
    else if(player.style < thresholds[2]) styleStyles.render(mPos, v(1, 0), v(0.5, 0.5))
    else if(player.style < thresholds[3]) styleStyles.render(mPos, v(2, 0), v(0.5, 0.5))
    else if(player.style < thresholds[4]) styleStyles.render(mPos, v(3, 0), v(0.5, 0.5))
    else if(player.style < thresholds[5]) styleStyles.render(mPos, v(0, 1), v(0.5, 0.5))
    else if(player.style < thresholds[6]) styleStyles.render(mPos, v(1, 1), v(0.5, 0.5))
    else if(player.style < thresholds[7]) styleStyles.render(mPos, v(2, 1), v(0.5, 0.5))
    else if(player.style < thresholds[8]) styleStyles.render(mPos, v(3, 1), v(0.5, 0.5))
    else if(player.style < thresholds[9]) styleStyles.render(mPos, v(0, 2), v(0.5, 0.5))
    else if(player.style < thresholds[10]) styleStyles.render(mPos, v(1, 2), v(0.5, 0.5))
    else if(player.style < thresholds[11]) styleStyles.render(mPos, v(2, 2), v(0.5, 0.5))
    else if(player.style > thresholds[11]) styleStyles.render(mPos, v(3, 2), v(0.5, 0.5))
    mPos = v(140, 60)
    ctx.fillStyle = "#49f"
    ctx.fillRect(mPos.x, mPos.y,64*getStyleInterval(), 8)
    let index = 0
    mPos = v(window.innerWidth - 256, 128)
    for(let obj of objects) {
        if(obj instanceof StyleText) {
            ctx.fillStyle = obj.colour
            ctx.font = "30px Arial"
            renderText("+ "+obj.value, v(mPos.x, mPos.y + index*32), undefined, 0.5)
            //ctx.fillText("+ "+obj.value, mPos.x, mPos.y + index*24)
            ctx.font = "10px Arial"
            index++
        }
    }

    

    //renderText("SERIFONIUM HERE")
}
function renderWeaponIcons() {

    function getMid(obj) {return v(obj.pos.x + obj.scale.x, obj.pos.y + obj.scale.y)}
    let borders = {min:300, max:window.innerWidth-300}

    ctx.globalAlpha = 0.75
    uiOverlay.render(v(0, 0), v(1, 0))
    ctx.globalAlpha = 1
    uiOverlay.render(v(0, 0), v(0, 0))
    

    let ind = undefined
    if(player.weaponSelected instanceof Piercer) ind = 0
    if(player.weaponSelected instanceof Shotgun) ind = 1
    if(player.weaponSelected instanceof RocketLauncher) ind = 2
    if(player.weaponSelected instanceof Railgun) ind = 3
    
    player.weaponSelected.uiRender()

    ammoTypes.render(v(140, 72), v(4, 1))
    ammoTypes.renderCustomArea(v(140, 72), v(4, 0), v(1, 1-player.punchCooldown.cur/player.punchCooldown.max))

    ctx.fillStyle = "#700"; ctx.fillRect(4, 140, 132, 25)
    ctx.fillStyle = "#0f0"; ctx.fillRect(4, 140, 1.32*player.health, 25)
    ctx.fillStyle = "#400"; ctx.fillRect(4, 188, 132, 25)
    ctx.fillStyle = "#f70"; ctx.fillRect(4, 188, 1.32*player.fuel, 25)
    ctx.fillStyle = "#06a"; ctx.fillRect(4, 164, 132, 24)
    ctx.fillStyle = "#0df"; ctx.fillRect(4, 164, 44*player.stam, 24)
    ctx.font = "25px Arial"

}

export {renderWeaponIcons, renderStyle, renderText}