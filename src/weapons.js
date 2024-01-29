import {player} from "./player.js"
import {getDeltaTime} from "./update.js"
import {Bullet, Enemy} from "./enemies.js"
import {objects, hoverVector, ctx, hover, untrs, recentShots} from "./startup.js"
import {audioCache} from "./audio.js"
import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox} from "./classes.js"
import { particleHandler } from "./particles.js"



const bulletMaxLen = 2000
function shoot() {
    let objs = []
    for(let o of objects) {
        if(!(o instanceof Trigger)) objs.push(o)
    }
    
    let v1 = v(player.pos.x+25, player.pos.y+25)
    let v2 = hoverVector
    let angle = getAngle(v1, v2)
    let gradient = undefined
    let offset = undefined
    gradient = -(v2.y-v1.y)/(v2.x-v1.x)
    offset = gradient*v1.x+v1.y
    
    
    let nearestpointscandidates = []
    let nearestpoint = null
    let playerpoint = {x:player.pos.x+25, y:player.pos.y+25}
    for (let obj of objs) {
        let points = []
        let mainfunc = getFunction(v1, v2)
        /*
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y)) )) 
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)) )) 
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y+obj.scale.y)) )) 
        debugAnglePoints.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y)) )) 
        */
        points.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y)), mainfunc )) 
        points.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)), mainfunc )) 
        points.push(findIntersection( getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y+obj.scale.y)), mainfunc )) 
        points.push(findIntersection( getFunction(v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x, obj.pos.y)), mainfunc )) 

        let objpoints = []
        for(let p of points) {
            if(overlapping(p.x, p.y, 1, 1, obj.pos.x-1, obj.pos.y-1, obj.scale.x+2, obj.scale.y+2)) {
                objpoints.push(p)
            }
        }
        if(objpoints.length!=0) {
            let closestPoint = null
            for(let r of objpoints) {
                if(closestPoint != null) {
                    if(getDistance(playerpoint, r) < getDistance(playerpoint, closestPoint)) {
                        closestPoint = r
                    }
                } else {
                    closestPoint = r
                }  
            }
            nearestpointscandidates.push({obj:obj, pos:closestPoint})
        }
    }
    let nearestpoints = []
    for(let e of nearestpointscandidates) {
        if (getDistance(playerpoint, e.pos) < bulletMaxLen) {
            if(angle > 0) {
                if(e.pos.x < playerpoint.x) {
                    nearestpoints.push(e)
                }
            } if(angle < 0) {
                if(e.pos.x > playerpoint.x) {
                    nearestpoints.push(e)
                }
            }
        }
    }
    for(let e of nearestpoints) {
        //debugAnglePoints.push(e.pos)
        if(nearestpoint != null) {
            
            if(getDistance(playerpoint, e.pos) < getDistance(playerpoint, nearestpoint.pos)) {
                nearestpoint = e
            }
        } else {
            nearestpoint = e
        }  
    }

    if(nearestpoint != null) {
        //console.log(nearestpoint.obj)
        //debugAnglePoints.push(nearestpoint.pos)
        let distance = getDistance(nearestpoint.obj.pos, player.middle)
        recentShots.push( [playerpoint, nearestpoint.pos, 333] )
        if(nearestpoint.obj.health != undefined) {
            nearestpoint.obj.damage(12.5)
        }
        if(nearestpoint.obj instanceof Bullet) {
            nearestpoint.obj.force = player
            let a = fetchAngle(nearestpoint.obj.pos, player.middle)
            nearestpoint.obj.vel.x = -Math.cos(a)
            nearestpoint.obj.vel.y = -Math.sin(a)
        }
        if(nearestpoint.obj instanceof Coin) {
            objects.push(new Explosion(nearestpoint.obj.middle, Math.sqrt(distance*250), {force:10, dmg:30}))
            objects[objects.length-1].explode()
            let a = fetchAngle(nearestpoint.obj.pos, player.middle)
            let force = 10
            //nearestpoint.obj.vel.x += -Math.cos(a) * force
            //nearestpoint.obj.vel.y += -Math.sin(a) * force * 2
        }
        if(nearestpoint.obj instanceof Rocket) {
            objects.push(new Explosion(nearestpoint.obj.middle, 640, {force:30, dmg:0, instantExplosion:true, alpha:0.2, colour:"#bbb"}))
            objects.push(new Explosion(nearestpoint.obj.middle, 480, {force:20, dmg:20, instantExplosion:true, alpha:0.5, colour:"#c77"}))
            objects.push(new Explosion(nearestpoint.obj.middle, 320, {force:10, dmg:30, instantExplosion:true, alpha:0.8, colour:"#d22"}))
            objects.push(new Explosion(nearestpoint.obj.middle, 120, {force:10, dmg:50, instantExplosion:true, alpha:1, colour:"#f00"}))
        }
    } else {
        let farpoint = v(0, 0)
        farpoint.x = playerpoint.x+Math.sin((angle+180) * Math.PI/180) * bulletMaxLen
        farpoint.y = playerpoint.y+Math.cos((angle+180) * Math.PI/180) * bulletMaxLen
        //console.log(farpoint)
        recentShots.push( [playerpoint, farpoint, 333] )
    }


   
}


class Weapon {
    constructor(type) {
        this.type = type
        this.fireRate = 600
        this.primaryFire = () => {

        }
    }
}

class Rocket {
    constructor(pos=v(0, 0), vel=v(0, 0)) {
        let scale = 48
        this.pos = v(pos.x-scale/2, pos.y-scale/2)
        this.scale = v(scale, scale)
        this.vel = vel
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.lifespan = 4000
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
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        if(this.lifespan<2000) this.vel.y += getDeltaTime()*6
        this.lifespan += -getDeltaTime(true)
        if(this.lifespan<0) this.explode()
        objects.forEach((obj)=>{
            if(overlap(this, obj)) {
                if(obj.damage) {
                    //obj.damage(this.dmg, 3, "RocketLauncher")
                    this.explode()
                }
                if(obj instanceof Hitbox) {
                    this.explode()
                }
                
            }
        })
    }
    explode() {
        objects.push(new Explosion(this.getMiddle(), 320, {lifespan:1000, dmg:50, instantExplosion:true}))
        if(this.lifespan<2000) objects.push(new Explosion(this.getMiddle(), 640, {lifespan:1000, dmg:10, force:32, instantExplosion:true}))
        this.remove()
    }
    render() {
        ctx.fillStyle = "#f30"
        if(this.lifespan<2000) {
            if(Math.floor(this.lifespan/2)%2)ctx.fillStyle = "#f3f"
            else ctx.fillStyle = "#f30"
        }
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
    }
}

class ShotgunPellet {
    constructor(pos=v(0, 0), vel=v(0, 0)) {
        let scale = 10
        this.pos = v(pos.x-scale/2, pos.y-scale/2)
        this.scale = v(scale, scale)
        this.vel = vel
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.lifespan = 500
        this.dmg = 2
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
    update() {
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.lifespan += -getDeltaTime()
        if(this.lifespan<0) this.remove()
        objects.forEach((obj)=>{
            if(overlap(this, obj)) {
                if(obj.damage) {
                    obj.damage(this.dmg, 1, "Shotgun")
                    this.remove()
                }
                if(obj instanceof Hitbox) {
                    particleHandler.burstParticles(this.pos, 4, 100, {
                        angleRange:30,
                        angle:(Math.atan2(this.vel.y, this.vel.x) / (Math.PI/180)),
                        duration:0.9,
                        speed:200,
                        colour: "#ff0000"

                    }, {
                        colour: "#ff0000"
                    })

                    this.remove()
                }
                
            }
        })
    }
    render() {
        if(this.hit) ctx.fillStyle = "#f36"
        else ctx.fillStyle = "#6f0"
        ctx.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y)
    }
}


class Piercer extends Weapon {
    constructor() {
        super("pistol")
        this.angle = undefined
        this.originPoint = v(0, 0)
        this.maxFireDist = 500
        this.primaryFire = () => {/*
            
            this.originPoint = player.middle
            this.angle = fetchAngle(this.originPoint, hoverVector)
            this.function = getFunction(this.originPoint, hoverVector)
            
            let intersections = []          
            for(let obj of objects) {
                let iteration = 0
                for(let i of [
                    findIntersection(this.function, getFunction(obj.pos, v(obj.pos.x+obj.scale.x, obj.pos.y))),
                    findIntersection(this.function, getFunction(obj.pos, v(obj.pos.x, obj.pos.y+obj.scale.y))),
                    findIntersection(this.function, getFunction(v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y))),
                    findIntersection(this.function, getFunction(v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)))
                ]) {
                    let inter = i
                    if((iteration%2==0)&&inter.x>obj.pos.x&&inter.x<obj.pos.x+obj.scale.x) {
                        intersections.push({obj:obj, inter:inter})
                    } if(!(iteration%2==0)&&inter.y>obj.pos.y&&inter.y<obj.pos.y+obj.scale.y) {
                        intersections.push({obj:obj, inter:inter})
                    }
                    iteration++
                }
            }

            console.log(intersections)
            function findLowest() {
                let u = undefined
                for(let i in intersections) {
                    if(u){
                        if(getDistance(i.inter, this.originPoint) < getDistance(u.inter, this.originPoint)){
                            u=i
                        }
                    } else {
                        u=i
                    }
                }
                return u
            }
            console.log(findLowest())*/
            audioCache.piercerShoot.play()
            shoot()
        }
        this.secondaryFire=()=>{
            player.throwCoin()
        }
        this.render = () => {
            if(this.angle) {
                ctx.strokeStyle = "#aaa"
                ctx.lineWidth = 15
                ctx.beginPath()
                ctx.moveTo(this.originPoint.x, this.originPoint.y)
                ctx.lineTo(this.originPoint.x+Math.cos(this.angle)*this.maxFireDist,this.originPoint.y+Math.sin(this.angle)*this.maxFireDist)
                ctx.stroke()
                ctx.lineWidth = 2
            }
        }
    }
}
class Shotgun extends Weapon {
    constructor() {
        super("shotgun")
        this.angle = undefined
        this.originPoint = v(0, 0)
        this.maxFireDist = 500
        this.shotgunPelletAmn = 15
        this.shotgunPelletVel = 320
        this.primaryFire = () => {
            for(let i = 0; i < this.shotgunPelletAmn;i++) {
                let angle = fetchAngle(player.middle, hoverVector)+(Math.random()-0.5)/2
                //console.log(angle)
                let ve = v(Math.cos(angle)*this.shotgunPelletVel, Math.sin(angle)*this.shotgunPelletVel)
                objects.push(new ShotgunPellet(player.middle, v(
                    ve.x*(1+(Math.random()-0.5)/6)+player.vel.x, ve.y*(1+(Math.random()-0.5)/6)+player.vel.y
                )))
            }
            particleHandler.burstParticles(player.middle, 50, 500, {
                angleRange:60,
                angle:(fetchAngle(player.middle, hoverVector))*(radSym),
                duration:1.1,
                speed:400,
                size: 50,
                colour: "#f93"

            }, {
                scale:30000,
            })
            audioCache["shotgun"].play()
            
        }
        this.secondaryFire=()=>{
            player.hyper()
        }
        this.render = () => {
            if(this.angle) {
                ctx.strokeStyle = "#aaa"
                ctx.lineWidth = 15
                ctx.beginPath()
                ctx.moveTo(this.originPoint.x, this.originPoint.y)
                ctx.lineTo(this.originPoint.x+Math.cos(this.angle)*this.maxFireDist,this.originPoint.y+Math.sin(this.angle)*this.maxFireDist)
                ctx.stroke()
                ctx.lineWidth = 2
            }
        }
    }
}

class RocketLauncher extends Weapon {
    constructor() {
        super("shotgun")
        this.angle = undefined
        this.originPoint = v(0, 0)
        this.maxFireDist = 500
        this.rocketVel = 320
        this.cooldown = 100
        this.cooldownMax = this.cooldown
        this.getAngle = () => {
            return fetchAngle(player.middle, hoverVector)
        }
        this.update = () => {
            this.cooldown = Math.min(this.cooldown+getDeltaTime(), this.cooldownMax)
        }
        this.primaryFire = () => {
            if(this.cooldown == this.cooldownMax) {
                this.angle = this.getAngle()
                this.originPoint = player.middle
                objects.push(new Rocket(player.getMiddle(), v(Math.cos(this.angle)*this.rocketVel, Math.sin(this.angle)*this.rocketVel)))
                this.cooldown = 0
            }
        }
        this.secondaryFire=()=>{
            
        }
        this.render = () => {
            
        }
    }
}

var Weapons = [
    new Piercer(),
    new Shotgun(),
    new RocketLauncher(),
    {},
    {},
]

export {Weapons, Piercer, Shotgun, RocketLauncher, ShotgunPellet, Rocket}