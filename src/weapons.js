
class Weapon {
    constructor(type) {
        this.type = type
        this.fireRate = 600
        this.primaryFire = () => {

        }
    }
}

class ShotgunPellet extends NoCollisionHitbox {
    constructor(pos=v(0, 0), vel=v(0, 0)) {
        let scale = 10
        super(v(pos.x-scale/2, pos.y-scale/2), v(scale, scale))
        this.vel = vel
        this.middle = v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        this.lifespan = 500
        this.dmg = 2
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
                    this.remove()
                }
                
            }
        })
    }
    render() {
        if(this.hit) ctx.fillStyle = "#f60"
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
        this.shotgunPelletVel = 20
        this.primaryFire = () => {
            for(let i = 0; i < this.shotgunPelletAmn;i++) {
                let angle = fetchAngle(player.middle, hoverVector)+(Math.random()-0.5)/2
                //console.log(angle)
                let ve = v(Math.cos(angle)*this.shotgunPelletVel, Math.sin(angle)*this.shotgunPelletVel)
                objects.push(new ShotgunPellet(player.middle, v(
                    ve.x*(1+(Math.random()-0.5)/6), ve.y*(1+(Math.random()-0.5)/6)
                )))
            }
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

var Weapons = [
    new Piercer(),
    new Shotgun(),
    {},
    {},
    {},
]