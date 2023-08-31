
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
    mPos = v(window.innerWidth - 512, 128)
    let index = 0
    for(let obj of objects) {
        if(obj instanceof StyleText) {
            ctx.fillStyle = obj.colour
            ctx.font = "30px Arial"
            ctx.fillText("+ "+obj.value, mPos.x, mPos.y + index*24)
            ctx.font = "10px Arial"
            index++
        }
    }

}