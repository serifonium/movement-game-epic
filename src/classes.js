class Hitbox {
    constructor(pos, scale, colour, update){
        this.pos = pos
        this.scale = scale
        this.colour = colour || "#fff"
        this.update = update
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
            }
        }
    }
    render() {
        ctx.fillStyle = this.colour
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
    }
}


class Trigger {
    constructor(pos, scale, onPlayerCollision){
        this.pos = pos
        this.scale = scale
        this.onPlayerCollision = onPlayerCollision
        this.active = true
    }
    update() {
        if(overlap(player, this)&&this.active) {
            this.onPlayerCollision()
            this.active = false
        }
    }
}

class World {
    constructor(objs){
        this.objects = objs || []
    }
    loadWorld() {
        /*
        objects = []
        for(let obj of this.objects) {
            objects.push(obj)
        }*/
        objects = this.objects
    }
}

class ParticleCloud {
    constructor(pos, radius, particle, frequency) {

    }
}

class Player {
    constructor() {
        this.pos = v(499, 499)
        this.vel = v(0, 0)
        this.scale = v(50, 100)
        this.stam = 3
        this.onGround = true
        this.speed = 8
        this.health =100
        this.middle = v(this.pos.x+this.scale.x/2,this.pos.y+this.scale.y/4)
        this.fuel = 50
        this.stats = {
            damageTaken:0,
        }
        this.style = 0
        this.weaponIndex=0
        this.alive = true

        this.punchCooldown = {cur:0,max:500}
        this.punchingPos = undefined
        this.punchOffset = 100
        this.punchDist = 150
        this.punchDmg = 20
        this.punchVel = 10

        this.whiplash = {
            pos: undefined,
            vel: v(0, 0),
            angle: undefined,
            active: false,
            speed:35,
            fuelCost:0,
            retractSpeed:25,
            disapplyDist:100,
            maxDist:2000,
            maxLen:1000,
            target:undefined,
            update:()=>{
                let whip = this.whiplash
                if(!whip.pos) whip.pos = player.middle
                if(getDistance(whip.pos, player.pos) > whip.maxDist) {whip.disapply();return null}
                if(!whip.target) {
                    whip.pos.x += Math.cos(whip.angle)*whip.speed
                    whip.pos.y += Math.sin(whip.angle)*whip.speed
                } else {
                    if(whip.target.health <= 0) {whip.disapply();return null}
                    whip.pos.x = whip.target.middle.x
                    whip.pos.y = whip.target.middle.y
                    let a = fetchAngle(player.pos, whip.target.pos)
                    if(!whip.target.whiplashable) {
                        this.vel.x = Math.cos(a)*whip.retractSpeed
                        this.vel.y = Math.sin(a)*whip.retractSpeed
                    } else {
                        whip.target.vel.x = -Math.cos(a)*whip.retractSpeed
                        whip.target.vel.y = -Math.sin(a)*whip.retractSpeed
                    }
                    if(getDistance(whip.target.middle, player.pos) < whip.disapplyDist) {whip.disapply();return null}
                }
                for(let obj of objects) {
                    if(overlap({pos:v(whip.pos.x-20,whip.pos.y-20),scale:v(40,40)}, obj)) {
                        if(obj instanceof Hitbox) {whip.disapply(); return undefined}
                        if(!whip.target) {
                            if(obj instanceof Enemy) {
                                whip.target = obj
                            }
                        }
                    }
                }
            }, render: ()=>{
                let whip = this.whiplash
                ctx.fillStyle = "#0df"
                ctx.strokeStyle = "#0df"
                ctx.lineWidth = 15
                ctx.beginPath()
                ctx.moveTo(player.middle.x,player.middle.y)
                ctx.lineTo(whip.pos.x,whip.pos.y)
                ctx.stroke()
                ctx.beginPath();
                ctx.arc(whip.pos.x, whip.pos.y, 10, 0, Math.PI*2)
                ctx.fill();
                ctx.lineWidth = 2
            }, apply:()=>{
                if(this.fuel > this.whiplash.fuelCost) {
                    this.whiplash.active=!this.whiplash.active;
                    this.whiplash.angle=fetchAngle(this.middle, v(hover.x+untrs('x'), hover.y+untrs('y')))
                    this.fuel += -this.whiplash.fuelCost
                }
            },disapply:()=>{
                this.whiplash.pos = undefined
                this.whiplash.angle = undefined
                this.whiplash.active = false
                this.whiplash.target = undefined
            }
        }
    }
    damage(a) {
        this.health += -a
        this.stats.damageTaken += a
        this.getStyle(-a, 6)
    }
    getStyle(a,d) {
        if(a>0) {
            a*=6/d
            if(!this.onGround) a*=2
            if(this.whiplash.target) a*=3
            if(fetchAngle(v(0, 0), this.vel)>3) a*=fetchAngle(v(0, 0), this.vel)/3
        }
        this.style += a
    }
    punch() {
        if(!this.punchingPos) {
            let a = fetchAngle(this.middle, v(hover.x+untrs('x'), hover.y+untrs('y')))
            //console.log(a*radSym, this.middle, hover)
            this.punchingPos = v(this.middle.x+Math.cos(a)*this.punchOffset,this.middle.y+Math.sin(a)*this.punchOffset)
            for(let obj of objects) {
                if(getDistance(this.punchingPos, obj.pos)<this.punchDist) {
                    if(obj instanceof Enemy) {
                        this.whiplash.target?obj.damage(this.punchDmg*2, 2):obj.damage(this.punchDmg, 2)
                        let m = Math.PI + fetchAngle(obj.pos,this.middle)
                        obj.vel = v(Math.cos(m)*this.punchVel, Math.sin(m)*this.punchVel)
                    }
                    if(obj instanceof Bullet && obj.force instanceof Enemy) {
                        let m = Math.PI + fetchAngle(obj.pos,this.middle)
                        obj.vel = v(Math.cos(m)*this.punchVel/5, Math.sin(m)*this.punchVel/5)
                        obj.force = player
                    }
                }
            }
            this.punchCooldown.cur = this.punchCooldown.max
        }
    }
    update() {
        this.middle = v(this.pos.x+this.scale.x/2,this.pos.y+this.scale.y/4)
        if(this.punchCooldown.cur>=0) {
            this.punchCooldown.cur += -(tick - lastTick)
        } else {
            this.punchCooldown.cur = 0
            this.punchingPos = undefined
        }
        if(this.health <= 0) {
            this.health = 0
            this.alive = false
        } else if(this.health < 100 && this.fuel > 0.2) {
            this.health += 0.2
            this.fuel += -0.2
        }
        if(keys["r"]){
            keys["r"]=false;
            this.whiplash.active?this.whiplash.disapply():this.whiplash.apply()
        }
        if(this.whiplash.active)this.whiplash.update()
        
    }
    render() {
        if(this.punchingPos) {
            ctx.globalAlpha = this.punchCooldown.cur/this.punchCooldown.max
            ctx.fillStyle = "#f05"
            ctx.beginPath();
            ctx.arc(this.punchingPos.x, this.punchingPos.y, this.punchDist, 0, Math.PI*2)
            ctx.fill();
            ctx.globalAlpha = 1
        }
        ctx.fillStyle = "#00aaff"
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
        if(this.whiplash.active)this.whiplash.render()
        Weapons[this.weaponIndex].render()
    }
}

let tutorial = new World([
    new Hitbox(v(-800, 600), v(6400, 50)),
    new Hitbox(v(-800, -300), v(50, 900)),
    new Hitbox(v(-800, -300), v(3200, 50)),
    new Hitbox(v(2800, -100), v(50, 700)),
    new Hitbox(v(2400, -600), v(50, 1000)),
    new Hitbox(v(2400, -600), v(800, 50)),
    new Hitbox(v(3200, -1400), v(50, 1800)),
    new Hitbox(v(3200, -1400), v(3200, 50)),
    new Trigger(v(2400, 400), v(50, 200), ()=>{
        tooltip = "[SPACE] against walls to wall jump."
    }),
    new Trigger(v(500, 500), v(50, 100), ()=>{
        tooltip = "Press [SHIFT] to dash."
    }),
    new Trigger(v(3200, 400), v(50, 200), ()=>{
        tooltip = "[LMB] to shoot."
        for(let i=0; i<2; i++) {
            objects.push(new Drone(v(3400+i*200, -400)))
            objects[objects.length-1].required = true
        }
        objects.push(new Hitbox(v(6400, -1400), v(50, 1500)))
        objects[objects.length-1].update = (th) => {
            let u = false
            for(let obj of objects) {
                if(obj.required) u = true
            }
            if(!u)th.remove()
        }
    }),
    new Hitbox(v(6400, 100), v(1650, 50)),
    new Trigger(v(6400, -1400), v(50, 1500), ()=>{
        tooltip = "Press [F] to punch."
        objects.push(new Virtue(v(6800, -400)))
        objects[objects.length-1].required = true
        objects.push(new Virtue(v(7600, -400)))
        objects[objects.length-1].required = true
        objects.push(new Hitbox(v(6400, -1400), v(1600, 50)))
        objects[objects.length-1].update = (th) => {
            let u = false
            for(let obj of objects) {
                if(obj.required) u = true
            }
            if(!u)th.remove()
        }
    }),
    new Hitbox(v(8000, -2400), v(50, 2500)),
    new Hitbox(v(3200, -2400), v(4800, 50)),
    new Trigger(v(6400, -2400), v(50, 1000), ()=>{
        tooltip = "Press [R] to whiplash enemies."
        for(let i=0; i<5; i++) {
            objects.push(new Drone(v(3400, -2200+i*200)))
            objects[objects.length-1].required = true
        }
        objects.push(new Hitbox(v(3200, -2400), v(50, 1000)))
        objects[objects.length-1].update = (th) => {
            let u = false
            for(let obj of objects) {
                if(obj.required) u = true
            }
            if(!u)th.remove()
        }
    }),
    new Trigger(v(3200, -2400), v(50, 1000), ()=>{
        tooltip = ""
        for(let i=0; i<10; i++) {
            objects.push(new Drone(v(2400, -2200+i*200)))
            objects[objects.length-1].required = true
        } for(let i=0; i<2; i++) {
            objects.push(new Virtue(v(1400, -2200+i*1000)))
            objects[objects.length-1].required = true
        }
    })
])