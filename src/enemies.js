class Enemy {
    constructor(pos, scale){
        this.pos = pos || v(0, 0)
        this.vel = v(0, 0)
        this.scale = scale
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.health = 50
        this.resistance = 1
        this.speed = 128
        this.acceldiv = 16
        this.whiplashable = false
        this.accelrand = (e) => {
            return Math.random()/e+(e-1)/e
        }
        this.damage = (a,d=6,method)=>{
            this.health += -a/this.resistance
            player.getStyle(a,d)
            if(player.fuel<100)player.fuel += a/(3*d)
            if(this.health<=0)this.remove()
            objects.push(new CombatText(v(this.middle.x, this.middle.y), a))
            if(method == "punch") {
                objects.push(new StyleText(v(this.middle.x, this.middle.y), "Fistful", "#05f"))
            } else if(method == "recoil") objects.push(new StyleText(v(this.middle.x, this.middle.y), "Recoil", "#f00"))
        }
        this.remove = () => {
            for(let o in objects) {
                if(objects[o] === this) {
                    objects.splice(o, 1)
                    return 0
                }
            }
        }
    }
} 

class Drone extends Enemy {
    constructor(pos, firerate) {
        super(pos, v(50, 50))
        this.health = 25
        this.movepoint = v(player.pos.x, player.pos.y)
        this.power = 0
        this.firetick = firerate || 1000
        this.playerDist = 600
        this.whiplashable = true
        this.render = () => {
            let a = this.getPlayerAngle()
            let s = this.scale.x
            let c = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
            let i = [Math.PI/2, Math.PI/-2]
            ctx.beginPath()
            //ctx.arc(c.x,c.y,s,0,Math.PI*2)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(c.x+Math.cos(a)*s, c.y+Math.sin(a)*s)
            for(let o of i) {
                ctx.lineTo(c.x+Math.cos(a+o)*s, c.y+Math.sin(a+o)*s)
            }
            ctx.fill()
        }
        this.getPlayerPointRad = () => {
            let rad = this.playerDist
            let center = player.middle

            let u = this.pos
            let l = center
            let m = (u.y-l.y)/(u.x-l.x)
            let c = u.y-m*u.x
            let a = Math.atan(m)
            let point
            if(u.x>l.x) point = v(rad*Math.cos(a)+l.x,rad*Math.sin(a)+l.y)
            else point = v(-rad*Math.cos(a)+l.x,-rad*Math.sin(a)+l.y)

            //debugAnglePoints.push(point)
            return point
        }
        this.getPlayerAngle = () => {
            let rad = this.playerDist
            let center = v(player.pos.x+player.scale.x/2, player.pos.y+player.scale.y/4)

            const LEAD_TARGET = true

            let leadingTarget = intercept(this.pos, {
                ...center,
                vx:player.vel.x,
                vy:player.vel.y,
            },
            10 
            )

            //console.log(leadingTarget)

            let u = this.pos
            let l = LEAD_TARGET?(leadingTarget||center):center
            let m = (u.y-l.y)/(u.x-l.x)
            let c = u.y-m*u.x
            let a
            u.x<l.x ? a = Math.atan(m) : a = Math.PI + Math.atan(m)
            //debugAnglePoints.push(point)
            return a
        }
        this.update = (e) => {
            this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
            this.accel = (d, p) => {
                if(d == 'x') {
                    if(p == '+') {
                        if(this.vel.x < this.speed) {
                            this.vel.x += this.speed/this.acceldiv*this.accelrand(3)
                        }
                    } else {
                        if(this.vel.x > -this.speed) {
                            this.vel.x += -this.speed/this.acceldiv*this.accelrand(3)
                        }
                    }
                }
                if(d == 'y') {
                    if(p == '+') {
                        if(this.vel.y < this.speed) {
                            this.vel.y += this.speed/this.acceldiv*this.accelrand(3)
                        }
                    } else {
                        if(this.vel.y > -this.speed) {
                            this.vel.y += -this.speed/this.acceldiv*this.accelrand(3)
                        }
                    }
                }
            }
            this.power += (tick - lastTick)
            if(this.power > this.firetick) {
                this.power += -this.firetick * getDeltaTime()
                objects.push(new Bullet(
                    v(this.pos.x+this.scale.x/2,this.pos.y+this.scale.y/2), v(Math.cos(this.getPlayerAngle()), Math.sin(this.getPlayerAngle())), this
                ))
            }
            this.movepoint = this.getPlayerPointRad()
            if(this.health > 0) {
                if(
                    this.playerDist<Math.sqrt(Math.pow(this.pos.x-player.pos.x,2)+Math.pow(this.pos.y-player.pos.y,2))
                ) {
                    if(this.movepoint.x > this.pos.x) {
                        this.accel('x','+')
                        //this.vel.x = this.speed
                    } else if(this.movepoint.x < this.pos.x) {
                        this.accel('x','-')
                    } else {
                        this.vel.x = 0
                    } if(this.movepoint.y > this.pos.y) {
                        this.accel('y','+')
                    } else if(this.movepoint.y < this.pos.y) {
                        this.accel('y','-')
                    } else {
                        this.vel.y = 0
                    }
                }
                //console.log(this.playerDist,Math.sqrt(Math.pow(this.pos.x-player.pos.x,2)+Math.pow(this.pos.y-player.pos.y,2)))
                if(
                    this.playerDist>=Math.sqrt(Math.pow(this.pos.x-player.pos.x,2)+Math.pow(this.pos.y-player.pos.y,2))
                ) {
                    this.vel.x *= 49/50
                    this.vel.y *= 49/50
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
    constructor(pos, vel, force) {
        this.pos = pos
        this.scale = v(20, 20)
        this.vel = vel
        this.speed = 10
        this.lifespan = 10000
        this.force = force
        this.remove = () => {
            for(let o in objects) {
                if(objects[o] === this) {
                    objects.splice(o, 1)
                }
            }
        }
        this.update = (e)=>{
            this.pos.x += this.vel.x*this.speed
            this.pos.y += this.vel.y*this.speed
            this.lifespan += -(tick-lastTick)
            if(this.lifespan<0) this.remove()
            
            for(let obj of objects) {
                if(overlapping(obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y, this.pos.x, this.pos.y, this.scale.x, this.scale.y)&&!(obj instanceof Bullet)&&!(obj instanceof this.force.constructor)) {
                    if(obj.health) { 
                        if(this.force.constructor == Player) obj.damage(this.speed, 4, "recoil")
                        else {obj.health += -this.speed}
                    }
                    this.remove()
                }
                
            }
            if(overlapping(player.pos.x, player.pos.y, player.scale.x, player.scale.y, this.pos.x, this.pos.y, this.scale.x, this.scale.y)){
                if(player.health) player.damage(this.speed)
                this.remove()
            }
        }
    }
}



class Husk extends Enemy {
    constructor(pos) {
        super(pos, v(50, 100))
        this.movepoint = v(player.pos.x, player.pos.y)
        this.power = 0
        this.playerDist = 600
        this.onGround = false
        this.speed = 10
        this.render = () => {
            ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
        }
        
        this.getPlayerPointRad = () => {
            let rad = this.playerDist
            let center = player.pos

            let u = this.pos
            let l = center
            let m = (u.y-l.y)/(u.x-l.x)
            let c = u.y-m*u.x
            let a = Math.atan(m)
            let point
            if(u.x>l.x) point = v(rad*Math.cos(a)+l.x,rad*Math.sin(a)+l.y)
            else point = v(-rad*Math.cos(a)+l.x,-rad*Math.sin(a)+l.y)

            //debugAnglePoints.push(point)
            return point
        }
        this.getPlayerAngle = () => {
            let rad = this.playerDist
            let center = v(player.pos.x+player.scale.x/2, player.pos.y+player.scale.y/4)

            let u = this.pos
            let l = center
            let m = (u.y-l.y)/(u.x-l.x)
            let c = u.y-m*u.x
            let a
            u.x<l.x ? a = Math.atan(m) : a = Math.PI + Math.atan(m)
            //debugAnglePoints.push(point)
            return a
        }
        this.accel = (d, p) => {
            if(d == 'x') {
                if(p == '+') {
                    if(this.vel.x < this.speed) {
                        this.vel.x += this.speed/this.acceldiv*this.accelrand(3)
                    }
                } else {
                    if(this.vel.x > -this.speed) {
                        this.vel.x += -this.speed/this.acceldiv*this.accelrand(3)
                    }
                }
            }
            if(d == 'y') {
                if(p == '+') {
                    if(this.vel.y < this.speed) {
                        this.vel.y += this.speed/this.acceldiv*this.accelrand(3)
                    }
                } else {
                    if(this.vel.y > -this.speed) {
                        this.vel.y += -this.speed/this.acceldiv*this.accelrand(3)
                    }
                }
            }
        }
        this.update = (e) => {
            this.movepoint = player.middle
            let u = true
            for(obj of objects) { if(overlapping(this.pos.x, this.pos.y+1, this.scale.x, this.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
                &&obj instanceof Hitbox) u = obj} //check if overlapping
            if(u==true) this.onGround = false 
            if(this.onGround == true) this.vel.y = 0
            if(!this.onGround) {
                if(this.vel.y < 30)this.vel.y += 1
            }
            u = true
            for(obj of objects) {if(overlapping(this.pos.x, this.pos.y+this.vel.y, this.scale.x, this.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)
                && playerCollisionExclusion(obj)) u = obj}
            if(u==true) { this.pos.y += this.vel.y } 
            else {
                if(this.vel.y > 0) {
                    this.pos.y = u.pos.y - this.scale.y - 0.1
                    this.onGround = true
                } else if(this.vel.y < 0) {
                    this.pos.y = u.pos.y + u.scale.y + 0.1
                    this.vel.y = 0
                }
            }
            if(this.onGround == true) this.vel.y = 0
            
            
            if(this.onGround) {
                if(this.vel.x > 0){ 
                    if(this.vel.x > this.speed) {
                        this.vel.x = this.vel.x * 0.94
                    } else {
                        this.vel.x += -0.25
                    }
                }
                if(this.vel.x < 0) {
                    if(this.vel.x > this.speed) {
                        this.vel.x = this.vel.x * 0.94
                    } else {
                        this.vel.x += 0.25
                    }
                }
                if((this.vel.x <= 0.25 && this.vel.x >= -0.25)) {
                    this.vel.x = 0
                }
                
            }

            if(this.movepoint.x > this.pos.x) {
                this.accel('x','+')
                //this.vel.x = this.speed
            } else if(this.movepoint.x < this.pos.x) {
                this.accel('x','-')
            } else {
                this.vel.x = 0
            }
            
            //this.pos.y += this.vel.y
            //this.pos.x += this.vel.x
        }
    }
}

class Virtue extends Enemy {
    static FIRING = false
    constructor(pos) {
        super(pos, v(75, 75))
        this.health = 50
        this.movepoint = v(player.pos.x, player.pos.y)
        this.power = 0
        this.speed = 2
        this.angle = Math.random()*Math.PI*2
        this.sourcePoint = v(this.pos.x,this.pos.y)
        this.wanderLimit = 400
        this.beam = {
            pos:player.middle,
            size:150,
            state:"charging",
            tick:0,
            chargingTick: 3000,
            launchTick:4000,
            fireTick:5000,
            cooldownTick:8000,
            hitPlayer:false
        }
        this.playerDist = 600
        this.render = () => {
            ctx.beginPath()
            ctx.arc(this.middle.x, this.middle.y, this.scale.x/2, 0, Math.PI*2)
            ctx.fill()
            ctx.fillStyle="#f33"
            if(this.beam.state == "charging")ctx.fillRect(this.beam.pos.x-this.beam.size/2,this.beam.pos.y+50, this.beam.size, 20)
            if(this.beam.state == "launch") {
                let a = 20
                for(let i=-1;i<a;i++) {
                    let u = this.beam.launchTick - this.beam.chargingTick
                    let o = this.beam.tick - this.beam.chargingTick
                    ctx.globalAlpha = 1-i/a
                    ctx.fillRect(this.beam.pos.x-this.beam.size/2,(this.beam.pos.y+50)-(Math.pow(1.5, i)*1*(o/u))*1, this.beam.size, 20)
                    ctx.globalAlpha = 1
                }
            }
            if(this.beam.state == "firing") {
                if(this.beam.tick > (this.beam.fireTick-100)) {
                    ctx.globalAlpha = (this.beam.tick-this.beam.fireTick+100)/100
                }
                else ctx.globalAlpha = 1
                ctx.globalAlpha *= 0.5
                ctx.fillRect(this.beam.pos.x-this.beam.size/2,-100000, this.beam.size, 200000)
                ctx.globalAlpha *= 2
                ctx.fillRect(this.beam.pos.x-this.beam.size/4,-100000, this.beam.size/2, 200000)
            } /*
            ctx.fillStyle="#f30"
            ctx.beginPath()
            ctx.arc(this.sourcePoint.x, this.sourcePoint.y, 4, 0, Math.PI*2)
            ctx.fill()
            ctx.strokeStyle="#f30"
            ctx.beginPath()
            ctx.arc(this.sourcePoint.x, this.sourcePoint.y, this.wanderLimit, 0, Math.PI*2)
            ctx.stroke()
            */
        } 
        this.remove = () => {
            if(this.beam.state=="launch")Virtue.FIRING = false
            for(let o in objects) {
                if(objects[o] === this) {
                    objects.splice(o, 1)
                    return 0
                }
            }
        }
        this.update = (e) => {
            //console.log(Virtue.FIRING)
            this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
            this.vel = v(0, 0)
            if(this.beam.state=="charging") {this.beam.pos = player.middle}
            if(!Virtue.FIRING||this.beam.state=="launch")this.beam.tick += getDeltaTime()+Math.random()*1-0.5
            if(this.beam.tick > this.beam.cooldownTick) {
                this.beam.tick += -this.beam.cooldownTick
                this.beam.hitPlayer = false
            }
            if(this.beam.tick < this.beam.chargingTick) this.beam.state = "charging"
            else if(this.beam.tick < this.beam.launchTick) {
                this.beam.state = "launch"
                Virtue.FIRING = true
            }
            else if(this.beam.tick < this.beam.fireTick) {
                if(!this.beam.hitPlayer&&overlap(player, {pos:v(this.beam.pos.x,-100000),scale:v(this.beam.size,200000)})) {
                    player.damage(50)
                    this.beam.hitPlayer = true
                }
                this.beam.state = "firing"
                Virtue.FIRING = false
                
            }
            else if(this.beam.tick < this.beam.cooldownTick) this.beam.state = "cooldown"


            this.angle += (Math.random()*1-0.5)/(Math.PI)

            this.vel.x = Math.cos(this.angle)*this.speed;
            if((()=>{
                for(let obj of checkObjsOverlap(this)) {if(obj instanceof Hitbox) return true}
                return false
            })() && (getDistance(this.middle, this.sourcePoint)>this.wanderLimit)) {
                
                this.vel.x = -Math.cos(this.angle)*this.speed
            }
            this.vel.y = Math.sin(this.angle)*this.speed
            if((()=>{
                for(let obj of checkObjsOverlap(this)) {if(obj instanceof Hitbox) return true}
                return false
            })() && (getDistance(this.middle, this.sourcePoint)>this.wanderLimit)) {
                this.vel.y += -Math.sin(this.angle)*this.speed
            }
            if(getDistance(this.middle, this.sourcePoint)>=this.wanderLimit) {
                this.angle += Math.PI
                this.vel.x = Math.cos(this.angle)*this.speed*5
                this.vel.y = Math.sin(this.angle)*this.speed*5
            }
        }
    }
}

class Idol extends Enemy {
    constructor(pos) {
        super(pos, v(100, 100))
        this.health = 100
        this.movepoint = v(player.pos.x, player.pos.y)
        this.target = undefined
        this.remove=()=>{
            if(this.target)this.target.resistance = 1
            for(let o in objects) {
                if(objects[o] === this) {
                    objects.splice(o, 1)
                    return 0
                }
            }
        }
    } 
    findTarget() {
        let target = undefined
        function checkAvaliability(o) {
            let avaliable = true
            objects.forEach((obj)=>{
                if((obj instanceof Idol)) {
                    if(obj.target == o) avaliable = false
                }
            })
            return avaliable
        }
        objects.forEach((obj)=>{
            if(obj instanceof Enemy && !(obj instanceof Idol)) {
                if(checkAvaliability(obj)) target = obj
            }
        })
        return target
    }
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.vel = v(0, 0)
        if(!this.target) {
            this.target = this.findTarget()
        } else {
            this.target.resistance = 1000000000000000000000
        }
    }
    render() {
        ctx.fillStyle = "#f09"
        ctx.strokeStyle = "#f09"
        ctx.beginPath()
        ctx.arc(this.middle.x, this.middle.y, 50, 0, Math.PI*2)
        ctx.fill()
        if(this.target) {
            ctx.globalAlpha = 0.5
            ctx.beginPath()
            ctx.arc(this.target.middle.x, this.target.middle.y, 125, 0, Math.PI*2)
            ctx.fill()
            ctx.lineWidth = 10
            ctx.beginPath()
            ctx.moveTo(this.middle.x, this.middle.y)
            ctx.lineTo(this.target.middle.x, this.target.middle.y)
            ctx.stroke()
            ctx.globalAlpha = 1
        }

    }
    
}

class Watcher extends Enemy {
    constructor(pos) {
        super(pos, v(256, 256))
        this.maxHealth = 500
        this.health = this.maxHealth
        this.movepoint = v(player.pos.x, player.pos.y)
        this.tex = v(0, 0)
        this.lifespan = 0
        this.blinkStamp = undefined
    } 
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.vel = v(0, 0)
        player.fuel = Math.max(0, player.fuel-0.4*getDeltaTime()*60/1000)
        this.lifespan += getDeltaTime()
        if(Math.random()<0.003 && !this.blinkStamp) {
            this.blinkStamp = this.lifespan
            console.log("e")
        }
        if(this.blinkStamp) {
            if(this.lifespan-100<this.blinkStamp) this.tex = v(1, 0)
            else if(this.lifespan-200<this.blinkStamp) this.tex = v(2, 0)
            else if(this.lifespan-300<this.blinkStamp) this.tex = v(3, 0)
            else if(this.lifespan-400<this.blinkStamp) this.tex = v(2, 0)
            else if(this.lifespan-500<this.blinkStamp) this.tex = v(1, 0)
            else if(this.lifespan-600<this.blinkStamp) {
                this.tex = v(0, 0)
                this.blinkStamp = undefined
                for(let i=0;i<1;i++) { 
                    let angle = fetchAngle(this.middle, player.middle)+Math.random()-0.5
                    objects.push(new Fire(this.middle, v(Math.cos(angle)*10, Math.sin(angle)*10), this))
                }
            }

        }
    }
    render() {
        ctx.fillStyle="#f07"
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(this.middle.x, this.middle.y, 125, 0, Math.PI*2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillRect(this.pos.x-64, this.pos.y+108, 384*(this.health/this.maxHealth), 32)
        watcherTexture.render(this.pos, this.tex, v(2, 2))
        
    }
    
}

class Fire extends NoCollisionHitbox{
    constructor(pos, vel, force) {
        super(pos, v(64, 64))
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.force = force
        this.vel = vel || v(0, 0)
        this.lifespan = 1000
        this.frameSpan = 0
        this.frame = 0
        this.frameLimit = 7
    }
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        objects.forEach((obj)=>{
            if(overlap(this, obj)) {
                if(obj.damage&&this.force!=obj)obj.health += -0.2
                if(obj instanceof Hitbox)this.vel=v(0, 0)
            }
        })
        if(overlap(this, player)) player.damage(0.5)
        this.frameSpan += getDeltaTime()
        this.lifespan += -getDeltaTime()
        if(this.frameSpan>200){
            this.frame++
            if(this.frame>this.frameLimit)this.frame+=-this.frameLimit
            this.frameSpan += -200
        }
        if(this.lifespan<0)this.remove()
    }
    render() {
        ctx.fillStyle = "#f00"
        //ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
        fireTexture.render(this.pos, v(this.frame, 0))
    }
}