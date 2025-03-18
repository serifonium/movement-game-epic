import {player} from "./player.js"
import {getDeltaTime} from "./update.js"
import {Bullet, Enemy, Watcher} from "./enemies.js"
import {objects, hoverVector, ctx, hover, untrs, recentShots} from "./startup.js"
import {audioCache} from "./audio.js"
import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox, RocketBomb} from "./classes.js"
import { particleHandler } from "./particles.js"
import { renderText } from "./render.js"
import { ammoTypes, redText, weaponStyles, whiteText } from "./image.js"



const bulletMaxLen = 20000
function shoot() {
    let objs = []
    for(let o of objects) {
        if(!(o instanceof Trigger)) objs.push(o)
    }
    
    let v1 = v(player.pos.x+32, player.pos.y+32)
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
            if(nearestpoint.obj.punched) {
                objects.push(new Explosion(nearestpoint.obj.middle, Math.sqrt(distance*250), {force:20, dmg:50}))
                objects.push(new Explosion(nearestpoint.obj.middle, Math.sqrt(distance*250)*Math.max(1, Math.sqrt(distance/500)), {force:10, dmg:30}))
                objects[objects.length-1].explode()
                objects[objects.length-1].explode()
            } else {
                objects.push(new Explosion(nearestpoint.obj.middle, Math.sqrt(distance*250), {force:10, dmg:30}))
                objects[objects.length-1].explode()
            }
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
        if(this.lifespan<2000) this.vel.y += getDeltaTime()/400
        this.lifespan -= getDeltaTime()
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
        particleHandler.burstParticles(this.getMiddle(), 2, 3, {colour:"#f30", duration:200})
        if(this.lifespan<2000) particleHandler.burstParticles(this.getMiddle(), 1, 3, {colour:"#fc0", speed:90, duration:5})
    }
    explode() {
        particleHandler.burstParticles(this.getMiddle(), 140, 5, {colour:"#ff0", speed:220, duration:4})
        objects.push(new Explosion(this.getMiddle(), 320, {lifespan:1000, dmg:50, instantExplosion:true}))
        if(this.lifespan<2000) objects.push(new Explosion(this.getMiddle(), 640, {lifespan:1000, dmg:10, force:32, instantExplosion:true}))
        this.remove()
    }
    render() {
        if(this.lifespan<2000&&Math.floor(this.lifespan/2)%2)ctx.fillStyle = "#f3f"
        else ctx.fillStyle = "#f30"
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
        this.clipSize = 8
        this.remainingAmmo = this.clipSize
        this.cooldown = 200
        this.cooldownMax = this.cooldown
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
            if(this.cooldown == this.cooldownMax) {
                audioCache.piercerShoot.play()
                shoot()
                this.cooldown = 0
                this.remainingAmmo -= 1
            }
        }
        this.update = () => {
            this.cooldown = Math.min(this.cooldown+getDeltaTime(), this.cooldownMax)
        }
        this.secondaryFire=()=>{
            if(player.coinCooldown.current == player.coinCooldown.max) {
                audioCache.coin.play()
                const DISTANCE = getDistance(player.middle, hoverVector)
                objects.push(new Coin(v(player.middle.x, player.middle.y), player.getPointingVel(Math.sqrt(DISTANCE)/15)))
                player.coinCooldown.current = 0
            }
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
    uiRender() {
        weaponStyles.render(v(6, 4), v(0, 0))
        ammoTypes.render(v(72, 72), v(0, 1))
        ammoTypes.renderCustomArea(v(72, 72), v(0, 0), v(1, this.cooldown/this.cooldownMax))
        renderText(String(this.remainingAmmo), v(4+20, 72+8), undefined, 0.75, redText)
    }
}
class Shotgun extends Weapon {
    constructor() {
        super("shotgun")
        this.angle = undefined
        this.originPoint = v(0, 0)
        this.maxFireDist = 500
        this.shotgunPelletAmn = 15
        this.shotgunPelletVel = 1.6
        this.clipSize = 8
        this.remainingAmmo = this.clipSize
        this.cooldown = 600
        this.cooldownMax = this.cooldown
        this.primaryFire = () => {
            if(this.cooldown == this.cooldownMax) {
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
                    duration:10,
                    speed:52,
                    size: 50,
                    colour: "#f93"

                }, {
                    scale:30000,
                })
                audioCache["shotgun"].play()
                this.cooldown = 0
                this.remainingAmmo -= 1
                if(this.remainingAmmo <= 0) {
                    this.cooldown = -this.cooldownMax*2
                    this.remainingAmmo = this.clipSize
                }
            }
        }
        this.secondaryFire=()=>{
            if(player.hyperCooldown.current == player.hyperCooldown.max) {
                let collisionBox = {pos:player.getHeadPos(),scale:v(1, 1000)}
                let highestY = -Infinity
                objects.forEach((obj)=>{
                    if(overlap(collisionBox, obj)&&(obj instanceof Hitbox)) {
                        if(highestY < obj.pos.y) highestY = obj.pos.y
                    }
                })
                if(highestY!=-Infinity) {
                    
                    //objects.push(new Explosion(v(player.middle.x, highestY), 400, {force:30}))
                    
                }

                const DISTANCE = getDistance(player.getHeadPos(), hoverVector)
                console.log(player.getPointingVel(Math.sqrt(DISTANCE)/500))
                objects.push(new ProjectileBomb(v(player.getHeadPos().x, player.getHeadPos().y), player.getPointingVel(Math.sqrt(DISTANCE)/20), 
                new Explosion(v(player.getHeadPos().x, highestY), 200, {force:4, colour:"#888d"})))
                player.hyperCooldown.current = 0
            }
        }
        this.update = () => {
            this.cooldown = Math.min(this.cooldown+getDeltaTime(), this.cooldownMax)
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
    uiRender() {
        weaponStyles.render(v(6, 4), v(1, 0))
        ammoTypes.render(v(72, 72), v(1, 1))
        ammoTypes.renderCustomArea(v(72, 72), v(1, 0), v(1, this.cooldown/this.cooldownMax))
        renderText(String(this.remainingAmmo), v(4+20, 72+8), undefined, 0.75, redText)
    }
}

class RocketLauncher extends Weapon {
    constructor() {
        super("rocketLauncher")
        this.angle = undefined
        this.originPoint = v(0, 0)
        this.maxFireDist = 500
        this.rocketVel = 1.6
        this.cooldown = 100
        this.clipSize = 3
        this.remainingAmmo = this.clipSize
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
                this.remainingAmmo -= 1
                if(this.remainingAmmo <= 0) {
                    this.cooldown = -this.cooldownMax
                    this.remainingAmmo = this.clipSize
                }
            }
        }
        this.secondaryFire=()=>{
            const DISTANCE = getDistance(player.middle, hoverVector)
            objects.push(new RocketBomb(player.getMiddle(), player.getPointingVel(Math.sqrt(DISTANCE)/15)))
        }
        this.render = () => {
            
        }
    }
    uiRender() {
        weaponStyles.render(v(6, 4), v(2, 0))
        ammoTypes.render(v(72, 72), v(2, 1))
        ammoTypes.renderCustomArea(v(72, 72), v(2, 0), v(1, this.cooldown/this.cooldownMax))
        renderText(String(this.remainingAmmo), v(4+20, 72+12), undefined, 0.75, redText)
    }
}
class Railgun extends Weapon {
    constructor() {
        super("railgun")
        this.clipSize = 2
        this.remainingAmmo = this.clipSize
        this.cooldown = 3000
        this.cooldownMax = this.cooldown
        this.angle = undefined
        this.maxFireDist = 250000000
        this.originPoint = undefined
    }
    primaryFire() {
        if(this.cooldown == this.cooldownMax) {
            let v1 = v(player.pos.x+32, player.pos.y+32)
            let v2 = hoverVector
            this.angle = fetchAngle(v1, v2)
            this.originPoint = v1
            let gradient = (v2.y-v1.y)/(v2.x-v1.x)
            let offset = v1.y-gradient*v1.x
            function checkObjIntersection(obj) {
                function checkXint(leftRange, rightRange, yVal) { //checks if the x int of a horizontal line is in range
                    let xInt = (yVal - offset) / gradient
                    if(leftRange < xInt && xInt < rightRange) {
                        if((xInt > v1.x && v1.x < v2.x)||(xInt < v1.x && v1.x > v2.x)) return v(xInt, yVal)
                    }
                    return undefined
                } function checkYint(topRange, bottomRange, xVal) { //checks if the y int of a vertical line is in range
                    let yInt = gradient*xVal+offset
                    if(topRange < yInt && yInt < bottomRange) {
                        if((xVal > v1.x && v1.x < v2.x)||(xVal < v1.x && v1.x > v2.x)) return v(xVal, yInt)
                    }
                    return undefined
                }
                let points = []
                points.push(
                    checkYint(obj.pos.y, obj.pos.y+obj.scale.y, obj.pos.x), checkYint(obj.pos.y, obj.pos.y+obj.scale.y, obj.pos.x+obj.scale.x), 
                    checkXint(obj.pos.x, obj.pos.x+obj.scale.x, obj.pos.y), checkXint(obj.pos.x, obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)
                )
                if (points.every((e)=>{
                    return e == undefined
                })) return undefined
                return obj
            }
            objects.forEach((obj)=>{
                if(checkObjIntersection(obj)) {
                    if(obj instanceof Enemy) {
                        obj.damage(100)
                    } if(obj instanceof Watcher) {
                        obj.damage(100)
                    } 
                }
            })
            this.cooldown = 0
            let speedMod = 3
            player.vel.x -= Math.cos(this.angle)*speedMod*2
            player.vel.y -= Math.sin(this.angle)*speedMod
            this.remainingAmmo -= 1
            if(this.remainingAmmo <= 0) {
                this.cooldown = -this.cooldownMax
                this.remainingAmmo = this.clipSize
            }
        }
    }
    render() {
        if(this.angle) {
            ctx.strokeStyle = "#09f"
            ctx.lineWidth = 96
            ctx.globalAlpha = Math.max(0, 1-this.cooldown/200)
            ctx.beginPath()
            ctx.moveTo(this.originPoint.x, this.originPoint.y)
            ctx.lineTo(this.originPoint.x+Math.cos(this.angle)*this.maxFireDist,this.originPoint.y+Math.sin(this.angle)*this.maxFireDist)
            ctx.stroke()
            ctx.lineWidth = 4
            ctx.globalAlpha = 1
        }
    }
    update() {
        this.cooldown = Math.min(this.cooldown+getDeltaTime(), this.cooldownMax)
        if(this.cooldown == this.cooldownMax) {
            this.angle = undefined
        }
    }
    uiRender() {
        weaponStyles.render(v(6, 4), v(3, 0))
        ammoTypes.render(v(72, 72), v(3, 1))
        ammoTypes.renderCustomArea(v(72, 72), v(3, 0), v(1, this.cooldown/this.cooldownMax))
        renderText(String(this.remainingAmmo), v(4+20, 72+12), undefined, 0.75, redText)
    }
}

var Weapons = [
    new Piercer(),
    new Shotgun(),
    new RocketLauncher(),
    new Railgun()
]

export {Weapons, Piercer, Shotgun, RocketLauncher, Railgun, ShotgunPellet, Rocket}