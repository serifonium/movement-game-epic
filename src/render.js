import {player} from "./player.js"
import {Piercer, Shotgun, RocketLauncher} from "./weapons.js"
import {ctx, objects, scaleFactor} from "./startup.js"
import {styleStyles} from "./image.js"
import {weaponStyles, redText, whiteText} from "./image.js"
//import {} from "./startup.js"
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
    let mPos = v(window.innerWidth - 128, 0)
    ctx.fillStyle = "#fff"
    if(player.style < thresholds[0]) {}
    else if(player.style < thresholds[1]) styleStyles.render(mPos, v(0, 0))
    else if(player.style < thresholds[2]) styleStyles.render(mPos, v(1, 0))
    else if(player.style < thresholds[3]) styleStyles.render(mPos, v(2, 0))
    else if(player.style < thresholds[4]) styleStyles.render(mPos, v(3, 0))
    else if(player.style < thresholds[5]) styleStyles.render(mPos, v(0, 1))
    else if(player.style < thresholds[6]) styleStyles.render(mPos, v(1, 1))
    else if(player.style < thresholds[7]) styleStyles.render(mPos, v(2, 1))
    else if(player.style < thresholds[8]) styleStyles.render(mPos, v(3, 1))
    else if(player.style < thresholds[9]) styleStyles.render(mPos, v(0, 2))
    else if(player.style < thresholds[10]) styleStyles.render(mPos, v(1, 2))
    else if(player.style < thresholds[11]) styleStyles.render(mPos, v(2, 2))
    else if(player.style > thresholds[11]) styleStyles.render(mPos, v(3, 2))
    mPos = v(window.innerWidth - 256, 128)
    ctx.fillStyle = "#49f"
    ctx.fillRect(mPos.x+128, mPos.y,128*getStyleInterval(), 16)
    let index = 0
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

    let ind = undefined
    if(player.weaponSelected instanceof Piercer) ind = 0
    if(player.weaponSelected instanceof Shotgun) ind = 1
    if(player.weaponSelected instanceof RocketLauncher) ind = 2
    
    weaponStyles.render(v(64, 64), v(ind, 0))
    /*
    ctx.fillStyle = "#444"
    ctx.fillStyle = "#fff"
    for(let w in Weapons) {
        let wep = Weapons[w]
        let place = (w)/(Weapons.length-1)
        w==player.weaponIndex?ctx.globalAlpha = 1:ctx.globalAlpha = 0.25
        let x_ = borders.min+place*(borders.max-borders.min-64)
        let y_ = window.innerHeight-200
        shotStyles.render(v(x_, y_), v(w, 0))
        ctx.globalAlpha = 1
        //ctx.fillRect(borders.min+place*(borders.max-borders.min-64), window.innerHeight-200, 64, 64)
        
    }*/
}

export {renderWeaponIcons, renderStyle, renderText}