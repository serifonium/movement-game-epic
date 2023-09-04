class Hitbox {
    constructor(pos, scale){
        this.pos = pos
        this.scale = scale
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
            }
        }
    }
}

class NoCollisionHitbox {
    constructor(pos, scale){
        this.pos = pos
        this.scale = scale
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
            }
        }
    }
}

class Item extends NoCollisionHitbox {
    constructor(pos, colour){
        super(pos, v(10, 10))
        this.colour = colour
        
    }
    render(){
        ctx.fillStyle = this.colour
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, 20, 0, Math.PI*2)
        ctx.fill()
    }
    update(){
        if(overlap(player, {pos:v(this.pos.x-10, this.pos.y-10), scale: v(20, 20)})) {
            this.remove()
            player.holding.push(this.colour)
        }
    }
}

class ItemStool extends NoCollisionHitbox {
    constructor(pos, colour, door){
        super(pos, v(40, 50))
        this.colour = colour
        this.active = false
        this.door = door
        this.onActivation=()=>{
            this.active = true
            this.door.remove()
        }
    }
    onLoad(){
        objects.push(this.door)
    }
    render(){
        ctx.fillStyle=this.colour
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
        if(this.active) {
            ctx.beginPath()
            ctx.arc(this.pos.x+this.scale.x/2, this.pos.y, 20, 0, Math.PI*2)
            ctx.fill()
        }
    }
    update(){
        if(overlap(player, this)) {
            let PLAYER_HAS_ORB = false
            for(let i in player.holding) {
                let item = player.holding[i]
                if(item == this.colour) {
                    PLAYER_HAS_ORB = true
                    player.holding.splice(i, 1)
                    this.onActivation()
                }
            }
        }
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

class GrindHandler {
    constructor(){
        this.wave = 0
        this.pos = v(10000000, 1000000)
        this.scale = v(0, 0)
        this.active = false
    }
    add_enemies() {
        var bounds = v(4000, 1000)
        var offset = v(0, -500)
        function generatePos() {
            return v(bounds.x*(Math.random()-0.5)+offset.x, bounds.y*(Math.random()-0.5)+offset.y)
        }
        var chances = {
            "Drone":0.8,
            "Virtue":0.1,
            "Idol":0.08,
            "Watcher":0.02
        }
        for(let i=0; i<=this.wave;i++) {
            let enemyType = Math.random()
            if(enemyType < chances["Drone"]) objects.push(new Drone(generatePos()))
            else if(enemyType < chances["Drone"]+chances["Virtue"]) objects.push(new Virtue(generatePos()))
            else if(enemyType < chances["Drone"]+chances["Virtue"]+chances["Idol"]) objects.push(new Idol(generatePos()))
            else objects.push(new Watcher(generatePos()))
        }
    }
    update() {
        if(this.active) {
            let ENEMY_EXISTS = false
            objects.forEach((obj)=>{if(obj instanceof Enemy)ENEMY_EXISTS=true}) 
            if(ENEMY_EXISTS) {
                
            } else {
                this.add_enemies()
                player.health = 100
                player.fuel = 50
                this.wave++
            }
            if(player.pos.y > 1000) {
                player.damage(1.5)
            }
        } else {
            if(keys["enter"]) this.active = true
        }
    }
    render() {
        renderText("WAVE "+String(this.wave), v(-200, 0), undefined, 2)
        if(!this.active)renderText("Press [ENTER] to start game.", v(-210, -42), undefined, 0.5)
        
        /*ctx.fillStyle = "#f90"
        ctx.font = "300px Arial"
        ctx.fillText(this.wave, 0, 0)
        ctx.font = "10px Arial"*/
    }
}

class World {
    constructor(objs){
        this.objects = objs || []
    }
    loadWorld() {
        objects = []
        for(let obj of this.objects) {
            objects.push(obj)
            if(obj.onLoad) obj.onLoad()
        }
    }
}

class ParticleCloud {
    constructor(pos, radius, particle, frequency) {

    }
}

class CombatText extends NoCollisionHitbox {
    constructor(pos, value) {
        super(v(pos.x, pos.y), v(1, 1))
        this.value = value
        this.vel = v(0, -4)
        this.life = 2000
    }
    render() {
        ctx.fillStyle = "#f90"
        ctx.font = "30px Arial"
        renderText(this.value, this.pos, undefined, 0.5)
        ctx.fillText(this.value, this.pos.x, this.pos.y)
        ctx.font = "10px Arial"
    }
    update() {
        this.life += -getDeltaTime()
        if(this.life < 0) this.remove()
    }
}

class StyleText extends NoCollisionHitbox {
    constructor(pos, value, colour) {
        super(pos, v(1, 1))
        this.value = value
        this.vel = v(0, -1.5)
        this.colour = colour || "#fff"
        this.life = 2000
    }
    render() {
        ctx.fillStyle = "#02f"
        ctx.font = "40px Arial"
        if(this.value>0)ctx.fillText(this.value, this.pos.x, this.pos.y)
        ctx.font = "10px Arial"
    }
    update() {
        this.life += -getDeltaTime()
        if(this.life < 0) this.remove()
    }
}

class CustomTextObject extends NoCollisionHitbox {
    constructor(pos, value, scale, spritesheet=redText) {
        super(v(pos.x, pos.y), v(1, 1))
        this.value = value
        this.vel = v(0, 0)
        this.scale = scale
        this.spritesheet = spritesheet
    }
    render() {
        ctx.fillStyle = "#02f"
        ctx.font = "40px Arial"
        renderText(this.value, v(this.pos.x, this.pos.y), undefined, this.scale, this.spritesheet)
        //if(this.value>0)ctx.fillText(this.value, this.pos.x, this.pos.y)
        ctx.font = "10px Arial"
    }
    update() {

    }
}

class ProjectileBomb extends NoCollisionHitbox {
    constructor(pos, vel, exp) {
        super(v(pos.x, pos.y), v(5, 5))
        this.vel = vel || v(0, 0)
        this.exp = exp
    }
    update() {
        this.vel.y += 0.5
        this.vel.x>0?this.vel.x+=-0.15:this.vel.x+=0.15
        objects.forEach((obj)=>{if(overlap(obj, this)&&(obj instanceof Hitbox || obj instanceof Enemy)){
            this.remove()
            this.exp.middle = this.pos
            objects.push(this.exp)
            this.exp.explode()
        }})
    }
    render() {
        ctx.fillStyle = "#f90"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, 15, 0, Math.PI*2)
        ctx.fill()
    }
}

class Coin extends NoCollisionHitbox {
    constructor(pos, vel) {
        let scale = 190
        super(v(pos.x-scale/2, pos.y-scale/2), v(scale, scale))
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.vel = vel
    }
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.vel.y += 0.5
        
        objects.forEach((obj)=>{if(overlap(obj, {pos:this.middle, scale:v(1, 1)})&&obj instanceof Hitbox){
            this.remove()
        }})
    }
    render() {
        ctx.fillStyle = "#bde848"
        ctx.beginPath()
        ctx.arc(this.middle.x, this.middle.y, 5, 0, Math.PI*2)
        ctx.fill()
        
    }
}



class Explosion {
    constructor(pos, radius, options={}) {
        this.pos = v(pos.x-radius, pos.y-radius)
        this.radius = radius
        this.middle = pos
        this.scale = v(radius, radius)

        this.lifetimeMax = options.lifetime || 400
        this.lifetime = this.lifetimeMax
        this.force = options.force || 5
        this.dmg = options.dmg || 0

        
    }
    explode() {
        audioCache.explosion.play()
        this.pushobj=(obj)=>{
            if(obj.vel&&obj.middle) {
                var DISTANCE = getDistance(obj.middle, this.middle)
                if(DISTANCE <= this.radius) {
                    let DISTMULTIPLIER = (this.radius/DISTANCE)
                    //console.log(DISTMULTIPLIER)
                    let angle = fetchAngle(obj.middle, this.middle)
                    if(obj.middle.x<this.middle.x) {obj.vel.x += -1*Math.cos(angle)*this.force; }
                    else {obj.vel.x += -Math.cos(angle)*this.force; }
                    obj.vel.y += -Math.sin(angle)*this.force
                    if(obj.damage){obj.damage(this.dmg, 3)}
                }
            }
        }
        objects.forEach((obj)=>{
            this.pushobj(obj)
        })
        this.pushobj(player)
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
            }
        }
    }
    render() {
        ctx.globalAlpha = this.lifetime/this.lifetimeMax
        ctx.fillStyle = "#f00"
        ctx.beginPath()
        ctx.arc(this.middle.x, this.middle.y, this.radius, 0, Math.PI*2)
        ctx.fill()
        ctx.globalAlpha = 1
    }
    update() {
        this.pos = v(this.middle.x-this.radius, this.middle.y-this.radius)
        this.lifetime = Math.max(this.lifetime-getDeltaTime(), 0)
        if(this.lifetime==0) {
            this.remove()
        }
    }
}


class Player {
    constructor(pos) {
        this.pos = pos || v(0, 0)
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
        this.weaponIndex=1
        this.weaponSelected=Weapons[1]
        this.alive = true
        this.holding = []
        this.god = false

        this.punchCooldown = {cur:0,max:500}
        this.punchingPos = undefined
        this.punchOffset = 100
        this.punchDist = 150
        this.punchDmg = 20
        this.punchVel = 10

        this.getPointingVel=(modifier)=>{
            let angle = fetchAngle(this.middle, hoverVector)
            let vel = v(0, 0)
            if(hoverVector.x<this.middle.x) vel.x = Math.cos(angle)*modifier
            else vel.x = Math.cos(angle)*modifier
            vel.y = Math.sin(angle)*modifier
            return vel
        }

        this.hyperCooldown = {max:1000, current:1000}
        this.coinCooldown = {max:300, current:300}
        this.throwCoin=()=>{
            if(this.coinCooldown.current == this.coinCooldown.max) {
                audioCache.coin.play()
                const DISTANCE = getDistance(player.middle, hoverVector)
                objects.push(new Coin(v(player.middle.x, player.middle.y), this.getPointingVel(Math.sqrt(DISTANCE))))
                this.coinCooldown.current = 0
            }
        }
        this.hyper = () => {
            if(this.hyperCooldown.current == this.hyperCooldown.max) {
                let collisonBox = {pos:player.middle,scale:v(1, 1000)}
                let highestY = -Infinity
                objects.forEach((obj)=>{
                    if(overlap(collisonBox, obj)&&(obj instanceof Hitbox)) {
                        if(highestY < obj.pos.y) highestY = obj.pos.y
                    }
                })
                if(highestY!=-Infinity) {
                    
                    //objects.push(new Explosion(v(player.middle.x, highestY), 400, {force:30}))
                    
                }

                const DISTANCE = getDistance(player.middle, hoverVector)
                objects.push(new ProjectileBomb(v(player.middle.x, player.middle.y), this.getPointingVel(Math.sqrt(DISTANCE)), 
                new Explosion(v(player.middle.x, highestY), 200, {force:50})))
                this.hyperCooldown.current = 0
            }
        }

        this.keybinds = {
            //"c":this.hyper,
            //"x":this.throwCoin,
            //"q":this.getPointingVel,
            "1":()=>{player.weaponSelected=Weapons[0]},
            "2":()=>{player.weaponSelected=Weapons[1]},
            "e":()=>{
                audioCache.weaponChange.play()
                if(player.weaponSelected instanceof Piercer) player.weaponSelected = Weapons[1]
                else if(player.weaponSelected instanceof Shotgun) player.weaponSelected = Weapons[0]
                keys["e"] = false
            },
        }

        this.whiplash = {
            pos: undefined,
            vel: v(0, 0),
            angle: undefined,
            active: false,
            speed:35,
            fuelCost:0,
            retractSpeed:25,
            disapplyDist:200,
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
                                objects.push(new StyleText(v(10000000, 10000000), "Whiplash", "#f90"))
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
                if(this.fuel >= this.whiplash.fuelCost) {
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
                if(obj.middle) {
                    if(getDistance(this.punchingPos, obj.middle)<this.punchDist) {
                        if(obj instanceof Enemy) {
                            this.whiplash.target?obj.damage(this.punchDmg*2, 2, "punch"):obj.damage(this.punchDmg, 2, "punch")
                            let m = Math.PI + fetchAngle(obj.pos,this.middle)
                            obj.vel = v(Math.cos(m)*this.punchVel, Math.sin(m)*this.punchVel)
                            audioCache["punch"].play()
                        }
                        if(obj instanceof Bullet && obj.force instanceof Enemy) {
                            let m = Math.PI + fetchAngle(obj.pos,this.middle)
                            obj.vel = v(Math.cos(m)*this.punchVel/5, Math.sin(m)*this.punchVel/5)
                            obj.force = player
                        }
                        if(obj instanceof ShotgunPellet) {
                            let m = Math.PI + fetchAngle(obj.pos,this.middle)
                            obj.vel.x += Math.cos(m)*this.punchVel 
                            obj.vel.y += Math.sin(m)*this.punchVel
                            obj.hit = true
                            obj.dmg = 5
                            obj.lifespan += 300
                        }
                    }
                }
            }
            this.punchCooldown.cur = this.punchCooldown.max
        }
    }
    update() {
        this.middle = v(this.pos.x+this.scale.x/2,this.pos.y+this.scale.y/4)
        if(player.god) {
            player.stam = 3
            player.health = 100
            player.fuel = Math.max(100, player.fuel)
        }
        if(this.punchCooldown.cur>=0) {
            this.punchCooldown.cur += -(tick - lastTick) * getDeltaTime()
        } else {
            this.punchCooldown.cur = 0
            this.punchingPos = undefined
        }
        if(this.health <= 0 && !player.god) {
            this.health = 0
            this.alive = false
        } else if(this.health < 100 && this.fuel > 0.2) {
            this.health += 0.2 * getDeltaTime()
            this.fuel += -0.2 * getDeltaTime()
        }
        if(keys["r"]){
            keys["r"]=false;
            this.whiplash.active?this.whiplash.disapply():this.whiplash.apply()
        }
        if(this.whiplash.active)this.whiplash.update()
        
        for(let key of Object.keys(this.keybinds)) {
            if(keys[key])this.keybinds[key]()
        }
        this.hyperCooldown.current = Math.min(this.hyperCooldown.current+getDeltaTime(), this.hyperCooldown.max)
        this.coinCooldown.current = Math.min(this.coinCooldown.current+getDeltaTime(), this.coinCooldown.max)
        
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
        for(let i in this.holding) {
            ctx.fillStyle = this.holding[i]
            ctx.beginPath()
            ctx.arc(player.middle.x, player.pos.y-25*i, 20, 0, Math.PI*2)
            ctx.fill()
        }
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

var earth1 = new World([
    new Hitbox(v(-500, 600), v(1500, 50)),
    new Hitbox(v(2000, 600), v(1000, 50)),
    new Hitbox(v(1000, 600), v(50, 1000)),
    new Hitbox(v(2000, 600), v(50, 1000)),

    new Hitbox(v(-5500, -400), v(6500, 50)),
    new Hitbox(v(2000, -400), v(1000, 50)),
    new Hitbox(v(1000, -4850), v(50, 4500)),
    new Hitbox(v(2000, -3350), v(50, 3000)),

    new Hitbox(v(3000, -400), v(50, 1050)),

    new Hitbox(v(0, 1600), v(1050, 50)),
    new Hitbox(v(2000, 1600), v(2000, 50)),
    new Hitbox(v(0, 1600), v(50, 1000)),
    new Hitbox(v(0, 2600), v(5000, 50)),

    new Hitbox(v(4300, -200), v(450, 50)),
    new Hitbox(v(4050, -1200), v(200, 50)),
    new Hitbox(v(4800, -1200), v(200, 50)),

    new Hitbox(v(5000, -4900), v(50, 7500)),
    new Hitbox(v(4000, -3400), v(50, 5000)),

    new Hitbox(v(2000, -3400), v(2000, 50)),
    new Hitbox(v(1000, -4900), v(4000, 50)),

    new Item(v(2500, -3550), "#f88"),
    new ItemStool(v(100, 550), "#f88", new Hitbox(v(0, -400), v(50, 1000))),


    new Trigger(v(1000, -400), v(50, 1000), ()=>{
        objects.push(new Virtue(v(1500, 400)))
    }), new Trigger(v(2000, 1600), v(50, 1000), ()=>{
        for(let i=0;i<5;i++){objects.push(new Drone(v(2500+i*150, 2000)))}
    }), new Trigger(v(4000, 1600), v(1000, 50), ()=>{
        objects.push(new Virtue(v(4500,-2400)))
    }),
    new Trigger(v(4000, -3400), v(1000, 50), ()=>{
        for(let i=0;i<5;i++){objects.push(new Drone(v(3500+i*150, -4700)))}
    }),




    new Hitbox(v(-500, 600), v(50, 1500)),
    new Hitbox(v(-3500, 600), v(50, 1500)),
    new Hitbox(v(-5500, 600), v(2000, 50)),

    new Trigger(v(-400, -400), v(50, 1000), ()=>{
        for(let i=0;i<15;i++){objects.push(new Drone(v(-3000+i*150, 1800)))}
    }),
])

var grind = new World([
    new Hitbox(v(-500, 200), v(1000, 50)),
    new Hitbox(v(-1500, -200), v(500, 50)),
    new Hitbox(v(1000, -200), v(500, 50)),
    new Hitbox(v(-2500, -600), v(500, 50)),
    new Hitbox(v(2000, -600), v(500, 50)),
    new Hitbox(v(2450, -1600), v(50, 1000)),
    new Hitbox(v(-2500, -1600), v(50, 1000)),
    new Hitbox(v(-1750, 600), v(1000, 50)),
    new Hitbox(v(750, 600), v(1000, 50)),
    new GrindHandler(),
    //new CustomTextObject(v(-250, 250), "Audio may take some time to intiate", 0.5, redText),
    new CustomTextObject(v(-300, 300), "The 'Grind' is an endless survival mode.", 0.5, redText),
    new CustomTextObject(v(-400, 300+32*2), "WASD - Movement", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*3), "Space - Jump", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*4), "SHIFT - Dash", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*5), "F - Punch", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*6), "R - Grapple", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*7), "E - Swap Weapon", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*8), "LMB - Primary Fire", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*9), "RMB - Alternate Fire", 0.5, whiteText),
    new CustomTextObject(v(-400, 300+32*10), "(+ -) - Zoom", 0.5, whiteText),
    new CustomTextObject(v(200, 300+32*2), "Enemies:", 0.5, whiteText),
    new CustomTextObject(v(200, 300+32*3), "Drone - Shoots bullets", 0.5, whiteText),
    new CustomTextObject(v(200, 300+32*4), "Virtue - Spawns aerial light beams", 0.5, whiteText),
    new CustomTextObject(v(200, 300+32*5), "Idol - Protects other enemies", 0.5, whiteText),
    new CustomTextObject(v(200, 300+32*6), "Watcher - Drains your fuel", 0.5, whiteText),
    //new Trigger(v(0, 100), v(50, 50), ()=>{objects.push(new Fire(v(-400, 100)), new Watcher(v(400, -100)))})

])
