
class Weapon {
    constructor(type) {
        this.type = type
        this.fireRate = 600
        this.primaryFire = () => {

        }
    }
}
class Piercer extends Weapon {
    constructor() {
        super("pistol")
        this.angle = undefined
        this.originPoint = v(0, 0)
        this.maxFireDist = 500
        this.primaryFire = () => {
            
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
            console.log(findLowest())
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
    {},
    {},
    {},
    {},
]