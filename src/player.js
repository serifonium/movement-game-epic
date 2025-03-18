import {ctx, objects, keys, hoverVector, hover, untrs, playerCollisionExclusion} from "./startup.js"
import {Weapons} from "./weapons.js"
import {getDeltaTime} from "./update.js"
import {audioCache} from "./audio.js"
import {Piercer, Shotgun, RocketLauncher, Railgun, Rocket, ShotgunPellet} from "./weapons.js"
import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox} from "./classes.js"
import {Enemy, Bullet} from "./enemies.js"
import { particleHandler } from "./particles.js"
import { pauseMenu } from "./menu.js"



class Player {
    constructor(pos) {
        this.pos = pos || v(0, 0)
        this.vel = v(0, 0)
        this.scale = v(50, 100)
        this.stam = 3
        this.onGround = true
        this.speed = 0.32
        this.health = 100
        this.middle = v(this.pos.x+this.scale.x/2,this.pos.y+this.scale.y/4)
        this.fuel = 50
        this.stats = {
            damageTaken:0,
        }
        this.style = 0
        this.weaponIndex=1
        this.weaponSelected=Weapons[0]
        this.alive = true
        this.holding = []
        this.god = false

        this.dashChain = 0
        this.dashCooldown = 0
        this.jumpCooldown = 0
        this.slamHeight = 0
        this.slamCooldown = 0
        this.slamActive = false

        this.punchCooldown = {cur:0,max:500}
        this.punchingPos = undefined
        this.punchOffset = 100
        this.punchDist = 150
        this.punchDmg = 20
        this.punchVel = 1

        this.styleThresholds = [100, 400, 800, 1500,  2400, 4000, 6500, 9000,  13000, 15000, 18000, 22500]

        this.getPointingVel=(modifier, max)=>{
            let angle = fetchAngle(this.getHeadPos(), hoverVector)
            let vel = v(0, 0)
            if(hoverVector.x<this.getHeadPos().x) vel.x = Math.cos(angle)*modifier
            else vel.x = Math.cos(angle)*modifier
            vel.y = Math.sin(angle)*modifier
            if(max) {
                vel.x = Math.min(max, vel.x)
                vel.y = Math.min(max, vel.y)
            }
            return vel
        }

        this.hyperCooldown = {max:1000, current:1000}
        this.coinCooldown = {max:300, current:300}
        this.hyper = () => {
            
        }
        this.getMiddle = () => {
            return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        } 
        this.getHeadPos = () => {
            return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/4)
        }

        this.keybinds = {
            //"c":this.hyper,
            //"x":this.throwCoin,
            //"q":this.getPointingVel,
            "1":()=>{this.weaponSelected=Weapons[0]},
            "2":()=>{this.weaponSelected=Weapons[1]},
            "3":()=>{this.weaponSelected=Weapons[2]},
            "4":()=>{this.weaponSelected=Weapons[3]},
            "e":()=>{
                //audioCache.weaponChange.play()
                if(this.weaponSelected instanceof Piercer) this.weaponSelected = Weapons[1]
                else if(this.weaponSelected instanceof Shotgun) this.weaponSelected = Weapons[2]
                else if(this.weaponSelected instanceof RocketLauncher) this.weaponSelected = Weapons[3]
                else if(this.weaponSelected instanceof Railgun) this.weaponSelected = Weapons[0]
                keys["e"] = false
            },
            "q":()=>{
                console.log(overlap(pauseMenu.buttons[0], {pos:hover, scale:v(1)}))
                keys["q"] = false
            },
            "escape":()=>{
                pauseMenu.openMenu()
            },
            "a":()=>{
                if(this.vel.x > -this.speed*2.3) {
                    this.vel.x += (-this.speed/50) * getDeltaTime()
                }
            }, "d":()=>{
                if(this.vel.x < this.speed*2.3) {
                    this.vel.x += (this.speed/50) * getDeltaTime()
                }
            }, " ":()=>{
                function checkSides() {
                    for(let obj of objects) {
                        if(obj instanceof Hitbox && playerCollisionExclusion(obj)) {
                            if(overlapping(player.pos.x+1, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) return "right"
                            if(overlapping(player.pos.x-1, player.pos.y, player.scale.x, player.scale.y, obj.pos.x, obj.pos.y, obj.scale.x, obj.scale.y)) return "left"
                        }
                    }
                    return false
                }
                if(this.onGround) {
                    if(this.slamCooldown > 0) { //REGULAR JUMPS
                        this.vel.y = -0.26 - this.slamHeight*2; 
                    } else {
                        this.vel.y = -2.2; 
                    }
                    
                    this.onGround = false
                } else { 
                    if(checkSides()!=false){ //WALL JUMPS
                        if(checkSides() == "left") {
                            this.vel.x = this.speed*4; 
                            this.vel.y = -2.2; 
                        } else if(checkSides() == "right") {
                            this.vel.x = -this.speed*4; 
                            this.vel.y = -2.2; 
                        }
                    }
                    else if(this.stam >= 2 && this.jumpCooldown == 0) { //AIR JUMPS
                        this.stam += -2
                        this.jumpCooldown = 500
                        if(this.slamCooldown > 0) {
                            this.vel.y = -2.2; 
                        } else {
                            this.vel.y = -2.2; 
                        }
                    }
                }
                keys[" "] = false
            }, "shift":()=>{
                this.dash()
                keys["shift"] = false
            }
        }

        this.whiplash = {
            pos: undefined,
            vel: v(0, 0),
            angle: undefined,
            active: false,
            speed:25,
            fuelCost:0,
            retractSpeed:.20,
            disapplyDist:100,
            maxDist:2000,
            maxLen:1000,
            target:undefined,
            update:()=>{
                let whip = this.whiplash
                if(!whip.pos) whip.pos = player.getMiddle()
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
                        this.vel.x = Math.cos(a)*whip.retractSpeed*getDeltaTime()
                        this.vel.y = Math.sin(a)*whip.retractSpeed*getDeltaTime()
                    } else {
                        whip.target.vel.x = -Math.cos(a)*whip.retractSpeed*getDeltaTime()/1.5
                        whip.target.vel.y = -Math.sin(a)*whip.retractSpeed*getDeltaTime()/1.5
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
                            
                            else if(obj instanceof Rocket) {
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
                    this.whiplash.angle=fetchAngle(this.middle, hoverVector)
                    this.fuel += -this.whiplash.fuelCost
                }
            }, disapply:()=>{
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
            let a = fetchAngle(this.getMiddle(), hoverVector)
            this.punchingPos = v(this.getMiddle().x+Math.cos(a)*this.punchOffset,this.getMiddle().y+Math.sin(a)*this.punchOffset)
            for(let obj of objects) {
                if(obj.getMiddle) {
                    if(getDistance(this.punchingPos, obj.getMiddle())<this.punchDist) {
                        if(obj instanceof Enemy) {
                            this.whiplash.target?obj.damage(this.punchDmg*2, 2, "punch"):obj.damage(this.punchDmg, 2, "punch")
                            let m = Math.PI + fetchAngle(obj.pos,this.getMiddle())
                            obj.vel = v(Math.cos(m)*this.punchVel, Math.sin(m)*this.punchVel)
                            audioCache["punch"].play()
                        }
                        if(obj instanceof Bullet && obj.force instanceof Enemy) {
                            let m = Math.PI + fetchAngle(obj.pos,this.getMiddle())
                            obj.vel = v(Math.cos(m)*this.punchVel, Math.sin(m)*this.punchVel)
                            obj.force = player
                        }
                        if(obj instanceof ShotgunPellet) {
                            let m = Math.PI + fetchAngle(obj.pos,this.getMiddle())
                            obj.vel.x += Math.cos(m)*this.punchVel 
                            obj.vel.y += Math.sin(m)*this.punchVel
                            obj.hit = true
                            obj.dmg = 5
                            obj.lifespan += 300
                        }
                        if(obj instanceof Coin) {
                            let speedMod = 0.5
                            let m = Math.PI + fetchAngle(obj.getMiddle(),this.getMiddle())
                            obj.vel.x += Math.cos(m)*this.punchVel*speedMod
                            obj.vel.y += Math.sin(m)*this.punchVel*speedMod
                            obj.punched = true
                        }
                    }
                }
            }
            this.punchCooldown.cur = this.punchCooldown.max
        }
    }
    updateMovement() {
        if(this.noclip) {

        } else {
            let objBelow = undefined
            for(let obj of objects) {
                if(overlap(obj, {pos:v(this.pos.x+16,this.pos.y+this.scale.y),scale:v(32,16)})&&obj.collision) {
                    objBelow = obj
                    
                }
            }
            if(!objBelow) {this.onGround = false;}
            if(!this.onGround) {
                if(this.vel.y < 1.9){this.vel.y += 0.006 * getDeltaTime();}
            }
            this.pos.y += this.vel.y * getDeltaTime()
            this.pos.x += this.vel.x * getDeltaTime()
            for(let obj of objects) {
                if(overlap(obj, this)&&obj.collision) {
                    let corners = [v(obj.pos.x, obj.pos.y), v(obj.pos.x+obj.scale.x, obj.pos.y), v(obj.pos.x, obj.pos.y+obj.scale.y), v(obj.pos.x+obj.scale.x, obj.pos.y+obj.scale.y)]
                    let closestCorner = corners[0]
                    for(let i in corners) if(getDistance(corners[i], this.getMiddle()) < getDistance(closestCorner, this.getMiddle())){closestCorner = corners[i]}
                    let angle = getAngle(closestCorner, this.getMiddle())
                    if((((angle < 45 && angle > -135) && closestCorner.x < obj.getMiddle().x)||((135 > angle && angle > -45) && closestCorner.x > obj.getMiddle().x)) && closestCorner.y < obj.getMiddle().y) {this.pos.y = obj.pos.y - this.scale.y - 0.01; this.onGround = true; this.vel.y = 0}
                    else if((((angle > 135 || angle < -90) && closestCorner.x < obj.getMiddle().x)||((angle < -135 || angle > 90) && closestCorner.x > obj.getMiddle().x)) && closestCorner.y > obj.getMiddle().y) {this.pos.y = obj.pos.y + obj.scale.y + 0.01; this.vel.y = 0}
                    else if((((-45 < angle || angle < 135) && closestCorner.y > obj.getMiddle().y)||((45 < angle || angle < -135) && closestCorner.y < obj.getMiddle().y)) && closestCorner.x < obj.getMiddle().x) {this.pos.x = obj.pos.x - this.scale.x - 0.01; this.vel.x = 0}
                    else if((((45 > angle || angle > -135) && closestCorner.y > obj.getMiddle().y)||((135 < angle || angle < -45) && closestCorner.y < obj.getMiddle().y)) && closestCorner.x > obj.getMiddle().x) {this.pos.x = obj.pos.x + obj.scale.x + 0.01; this.vel.x = 0}
                }
            }
            if(this.onGround) {
                this.vel.x *= 0.90
                if(Math.abs(this.vel.x)<0.02) {this.vel.x=0}
            }
        }
    }
    dash() {
        let dashMax = 5
        let dashSpeed = 1.5
        if(this.stam >= 1 && this.dashCooldown == 0) {
            this.stam += -1
            this.dashCooldown = 100
            this.dashChain += 1

            dashSpeed += this.dashChain*0.5

            if(keys["d"]) {
                this.vel.x = dashSpeed
            } else if(keys["a"]) {
                this.vel.x = -dashSpeed
            } else if(this.vel.x > 0) {
                this.vel.x = dashSpeed
            } else if(this.vel.x < 0) {
                this.vel.x = -dashSpeed
            }
        }


    }
    update() {
        
        this.updateMovement()
        this.middle = v(this.pos.x+this.scale.x/2,this.pos.y+this.scale.y/4)
        if(player.god) {
            player.stam = 3
            player.health = 100
            player.fuel = Math.max(100, player.fuel)
        }
        if(this.punchCooldown.cur>=0) {
            this.punchCooldown.cur += -getDeltaTime(true)
        } else {
            this.punchCooldown.cur = 0
            this.punchingPos = undefined
        }
        if(this.health <= 0 && !player.god) {
            this.health = 0
            this.alive = false
        } else if(this.health < 100 && this.fuel > 0.2) {
            this.health += 0.02 * getDeltaTime()
            this.fuel += -0.02 * getDeltaTime()
        }
        if(keys["r"]){
            keys["r"]=false;
            this.whiplash.active?this.whiplash.disapply():this.whiplash.apply()
        }
        if(this.whiplash.active)this.whiplash.update()
        
        for(let key of Object.keys(this.keybinds)) {
            if(keys[key])this.keybinds[key]()
        }
        this.hyperCooldown.current = Math.min(this.hyperCooldown.current+getDeltaTime(true), this.hyperCooldown.max)
        this.coinCooldown.current = Math.min(this.coinCooldown.current+getDeltaTime(true), this.coinCooldown.max)
        
    }
    render() {
        if(this.punchingPos) {
            ctx.globalAlpha = Math.max(0, this.punchCooldown.cur/this.punchCooldown.max)
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
        Weapons[3].render()
        for(let i in this.holding) {
            ctx.fillStyle = this.holding[i]
            ctx.beginPath()
            ctx.arc(player.middle.x, player.pos.y-25*i, 20, 0, Math.PI*2)
            ctx.fill()
        }
    }
}
function playerRespawn() {
    player = new Player()
}

var player = new Player()
export {player, Player, playerRespawn}