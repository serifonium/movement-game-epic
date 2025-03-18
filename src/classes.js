import {ctx, objects, keys, DebugRender} from "./startup.js"
import {renderText} from "./render.js"
import {player} from "./player.js"
import {getDeltaTime} from "./update.js"
import {audioCache} from "./audio.js"
import {Enemy, Drone, Virtue, Idol, Watcher, Bullet} from "./enemies.js"
import { particleHandler } from "./particles.js"

class Hitbox {
    constructor(pos, scale){
        this.pos = pos
        this.scale = scale
        this.collision = true
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
            }
        }
    }
    render() {
        ctx.fillStyle = "#fff"
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
    }
    getMiddle() {
        return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
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
                var WHIPLASH_CONNECTED = player.whiplash.target === this
                if(WHIPLASH_CONNECTED) player.whiplash.disapply()
                objects.splice(o, 1)
            }
        }
    }
    getMiddle() {
        return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
    }
}
//console.log(NoCollisionHitbox)

class PlatformHitbox extends Hitbox {
    constructor(pos, scale){
        super(pos, scale)
        this.collision = true
    }
    remove() {
        for(let o in objects) {
            if(objects[o] === this) {
                objects.splice(o, 1)
            }
        }
    }
    update() {
        let S_KEY_PRESSED = keys["s"]==true
        let PLAYER_BELOW = player.pos.y+player.scale.y > this.pos.y

        if(S_KEY_PRESSED || PLAYER_BELOW) {this.collision = false}
        else {this.collision = true}
        
    }
    render() {
        ctx.fillStyle="#fff"
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
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
        /*
        if(Math.random()<0.001) {
            objects.push(new CustomTextObject(v(Math.random()*2000-1000, -1000), 
            ["PUNISHMENT", "HAPPINESS", "SADNESS"][Math.floor(Math.random()*3)], 
            0.5, redText))
            objects[objects.length-1].vel.y = 50
        }
        */
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
        //objects = []
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
        this.vel = v(0, -0.12)
        this.life = 300
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
        this.scale = v(scale)
        this.spritesheet = spritesheet
        this.collision = false
    }
    render() {
        ctx.fillStyle = "#02f"
        ctx.font = "40px Arial"
        renderText(this.value, v(this.pos.x, this.pos.y), undefined, this.scale.x, this.spritesheet)
        //if(this.value>0)ctx.fillText(this.value, this.pos.x, this.pos.y)
        ctx.font = "10px Arial"
    }
    update() {
        this.vel = v(0, 0)
    }
}

class ProjectileBomb extends NoCollisionHitbox {
    constructor(pos, vel, exp) {
        super(v(pos.x, pos.y), v(5, 5))
        this.vel = vel || v(0, 0)
        this.exp = exp
    }
    update() {
        this.vel.y += 0.02
        this.vel.x>0?this.vel.x+=-0.005:this.vel.x+=0.005
        objects.forEach((obj)=>{if(overlap(obj, this)&&(obj instanceof Hitbox || obj instanceof Enemy)){
            this.remove()
            this.exp.middle = this.pos
            objects.push(this.exp)
            this.exp.explode()
        }})
    }
    render() {
        ctx.fillStyle = "#888"
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
        this.punched = false
    }
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.vel.y += 0.02
        
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
    constructor(pos, radius, customOptions={}) {

        let options = {
            dmg:0,
            force:5,
            lifetime: 400,
            instantExplosion:false,
            alpha: 1,
            colour: "#f00",
            particles: {
                num:90,
                size:1, 
                options: {
                    angleRange:360,
                    angle:360,
                    duration:0.9,
                    speed:200,
                    colour: "#ff0000"
                }
            },
            ...customOptions
        }
        

        this.pos = v(pos.x-radius, pos.y-radius)
        this.radius = radius
        this.middle = pos
        this.scale = v(radius, radius)

        for(let key in options) {
            this[key] = options[key]
        }

        this.lifetimeMax = this.lifetime
        if(this.instantExplosion) this.explode()
        
    }
    getMiddle() {
        return v(this.pos.x+this.radius, this.pos.y+this.radius)
    }
    explode() {
        if(this.particles) {
            particleHandler.burstParticles(this.getMiddle(), this.particles.num, this.particles.size, this.particles.options)
        }
        audioCache.explosion.play()
        this.pushobj=(obj)=>{
            if(obj.vel) {
                if(obj.middle) {
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
                } else {
                    var DISTANCE = getDistance(obj.pos, this.middle)
                    if(DISTANCE <= this.radius) {
                        let DISTMULTIPLIER = (this.radius/DISTANCE)
                        //console.log(DISTMULTIPLIER)
                        let angle = fetchAngle(obj.pos, this.middle)
                        if(obj.pos.x<this.middle.x) {obj.vel.x += -1*Math.cos(angle)*this.force; }
                        else {obj.vel.x += -Math.cos(angle)*this.force; }
                        obj.vel.y += -Math.sin(angle)*this.force
                        if(obj.damage){obj.damage(this.dmg, 3)}
                    }
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
        ctx.globalAlpha = (this.lifetime/this.lifetimeMax)*this.alpha
        ctx.fillStyle = this.colour
        ctx.beginPath()
        ctx.arc(this.middle.x, this.middle.y, this.radius, 0, Math.PI*2)
        ctx.fill()
        ctx.globalAlpha = 1
    }
    update() {
        this.pos = v(this.middle.x-this.radius, this.middle.y-this.radius)
        this.lifetime = Math.max(this.lifetime-getDeltaTime(true), 0)
        if(this.lifetime==0) {
            this.remove()
        }
    }
} 

class RocketBomb extends NoCollisionHitbox {
    constructor(pos, vel) {
        super(pos, v(32, 32))
        this.vel = vel || v(0, 0)
    }
    updateMovement() {
        if(this.vel.y < 1.9){this.vel.y += 0.006 * getDeltaTime();}
        this.pos.y += this.vel.y * getDeltaTime()
        this.pos.x += this.vel.x * getDeltaTime()
        for(let obj of objects) {
            if(overlap(obj, this)&&obj.collision) {
                let corners = [v(obj.pos.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)]
                let closestCorner = corners[0]
                for(let i in corners) if(getDistance(corners[i], this.getMiddle()) < getDistance(closestCorner, this.getMiddle())){closestCorner = corners[i]}
                let angle = getAngle(closestCorner, this.getMiddle())
                if((((angle < 45 && angle > -135) && closestCorner.x < obj.getMiddle().x)||((135 > angle && angle > -45) && closestCorner.x > obj.getMiddle().x)) && closestCorner.y < obj.getMiddle().y) {this.pos.y = obj.pos.y - this.scale.y - 0.01; this.onGround = true; this.vel.y *= -0.9999} //TOP
                else if((((angle > 135 || angle < -90) && closestCorner.x < obj.getMiddle().x)||((angle < -135 || angle > 90) && closestCorner.x > obj.getMiddle().x)) && closestCorner.y > obj.getMiddle().y) {this.pos.y = obj.pos.y + obj.scale.y + 0.01; this.vel.y *= -1} //BOTTOM
                else if((((-45 < angle || angle < 135) && closestCorner.y > obj.getMiddle().y)||((45 < angle || angle < -135) && closestCorner.y < obj.getMiddle().y)) && closestCorner.x < obj.getMiddle().x) {this.pos.x = obj.pos.x - this.scale.x - 0.01; this.vel.x *= -1} //LEFT
                else if((((45 > angle || angle > -135) && closestCorner.y > obj.getMiddle().y)||((135 < angle || angle < -45) && closestCorner.y < obj.getMiddle().y)) && closestCorner.x > obj.getMiddle().x) {this.pos.x = obj.pos.x + obj.scale.x + 0.01; this.vel.x *= -1} //RIGHT
            }
        }
    }
    update() {
        this.updateMovement()
    }
    render() {
        ctx.fillStyle = "#f90"; ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
    }
}



export {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox, RocketBomb}