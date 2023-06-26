

function update() {
    tick = Date.now()


    for(obj of objects) {
        if(obj.vel != undefined) {
            obj.pos.x += obj.vel.x
            obj.pos.y += obj.vel.y
        } if(obj.update != undefined) {
            obj.update(obj)
        }
    }
    for(obj of objects) {
        if(overlapping(player.pos.x, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y) && obj instanceof Trigger) {
            //obj.onPlayerCollision()
        }
    }
    let u = true
    for(obj of objects) {
        if(overlapping(player.pos.x+player.vel.x, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
        && playerCollisionExclusion(obj)) {u = obj}
    }
    if(u==true) {
        player.pos.x += player.vel.x
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
    for(obj of objects) {
        if(overlapping(player.pos.x, player.pos.y+player.vel.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
        && playerCollisionExclusion(obj)) u = obj
    }
    if(u==true) {
        player.pos.y += player.vel.y
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
    u = true
    for(obj of objects) {
        if(overlapping(player.pos.x, player.pos.y+1, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
        && playerCollisionExclusion(obj)) u = obj
    }
    if(u==true) {
        player.onGround = false
    }
    if(player.onGround == true) player.vel.y = 0

    if(!player.onGround) {
        if(player.vel.y < 30)player.vel.y += 1
    }
    if(player.onGround) {
        if(player.vel.x > 0){ 
            if(player.vel.x > player.speed) {
                player.vel.x = player.vel.x * 0.94
            } else {
                player.vel.x += -0.25
            }
        }
        if(player.vel.x < 0) {
            if(player.vel.x > player.speed) {
                player.vel.x = player.vel.x * 0.94
            } else {
                player.vel.x += 0.25
            }
        }
        if((player.vel.x <= 0.25 && player.vel.x >= -0.25) && (!keys['a'] && !keys['d'])) {
            player.vel.x = 0
        }
        slamActive = false
    }

    function dash() {
        let dashMax = 42
        let dashSpeed = 22
        if(player.stam >= 1 && dashCooldown == 0) {
            player.stam += -1
            dashCooldown = 10
            dashChain += 1

            dashSpeed += dashChain*2
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
        player.stam += 0.02
    } else {
        player.stam = 3
    }
    if(player.vel.x < 8 && player.vel.x > -8) dashChain = 0
    function slam() {
        if(!slamActive && !player.onGround) {
            player.vel.y = 40
            slamCooldown = 100
            slamHeight += 1
            slamActive = true
        }
    }
    function checkSides() {
        for(obj of objects) {
            if(overlapping(player.pos.x+1, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) return "right"
            if(overlapping(player.pos.x-1, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) return "left"
        }
        return false
    }


    if(keys["d"]) {
        if(player.vel.x < player.speed) {
            player.vel.x += player.speed/8
        }
    }
    if(keys["a"]) {
        if(player.vel.x > -player.speed) {
            player.vel.x += -player.speed/8
        }
        
    }
    if((keys[" "])) {
        if(player.onGround) {
            if(slamCooldown > 0) { //REGULAR JUMPS
                player.vel.y = -26 - slamHeight*2; 
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
            else if(player.stam >= 2 && jumpCooldown == 0) { //AIR JUMPS
                player.stam += -2
                jumpCooldown = 100
                if(slamCooldown > 0) {
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
    if(keys["+"]) {
        scaleFactor *= 2
        keys["+"] = false
    } if(keys["-"]) {
        scaleFactor *= 1/2
        keys["-"] = false
    }
    

    
    if(dashCooldown > 0) dashCooldown += -(tick - lastTick)
    else dashCooldown = 0

    
    if(jumpCooldown > 0) jumpCooldown += -(tick - lastTick)
    else jumpCooldown = 0

    if(recentShotLen > 0) recentShotLen += -(tick - lastTick)
    else recentShotLen = 0

    for(let i of recentShots) {
        if(i[2] > 0) i[2] += -(tick - lastTick)
        else i[2] = 0
    }

    if(player.onGround) {
        if(slamCooldown > 0) slamCooldown += -(tick - lastTick)
        else { 
            slamCooldown = 0
            slamHeight = 0
        }
    }
    lastTick = Date.now()
}

setInterval(update, 1000/60)