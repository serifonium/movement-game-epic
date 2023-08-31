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


function renderStyle() {
    let thresholds = [100, 400, 800, 1500,  2400, 4000, 6500, 9000,  13000, 15000, 18000, 22500]
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
    weaponStyles.render(v(64, 64), v(ind, 0))

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
        
    }
}