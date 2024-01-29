import {ctx, objects, keys, hoverVector, hover, untrs} from "./startup.js"
import {Weapons} from "./weapons.js"
import {getDeltaTime} from "./update.js"
import {audioCache} from "./audio.js"
import {Piercer, Shotgun, RocketLauncher, Rocket, ShotgunPellet} from "./weapons.js"
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
        this.punchVel = 10

        this.styleThresholds = [100, 400, 800, 1500,  2400, 4000, 6500, 9000,  13000, 15000, 18000, 22500]

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
                objects.push(new Coin(v(player.middle.x, player.middle.y), this.getPointingVel(Math.sqrt(DISTANCE)*10)))
                this.coinCooldown.current = 0
            }
        }
        this.hyper = () => {
            if(this.hyperCooldown.current == this.hyperCooldown.max) {
                let collisionBox = {pos:player.middle,scale:v(1, 1000)}
                let highestY = -Infinity
                objects.forEach((obj)=>{
                    if(overlap(collisionBox, obj)&&(obj instanceof Hitbox)) {
                        if(highestY < obj.pos.y) highestY = obj.pos.y
                    }
                })
                if(highestY!=-Infinity) {
                    
                    //objects.push(new Explosion(v(player.middle.x, highestY), 400, {force:30}))
                    
                }

                const DISTANCE = getDistance(player.middle, hoverVector)
                objects.push(new ProjectileBomb(v(player.middle.x, player.middle.y), this.getPointingVel(Math.sqrt(DISTANCE)*10), 
                new Explosion(v(player.middle.x, highestY), 200, {force:50})))
                this.hyperCooldown.current = 0
            }
        }
        this.getMiddle = () => {
            return v(this.pos.x+this.scale.x/2, this.pos.y+this.scale.y/2)
        }

        this.keybinds = {
            //"c":this.hyper,
            //"x":this.throwCoin,
            //"q":this.getPointingVel,
            "1":()=>{player.weaponSelected=Weapons[0]},
            "2":()=>{player.weaponSelected=Weapons[1]},
            "3":()=>{player.weaponSelected=Weapons[2]},
            "e":()=>{
                //audioCache.weaponChange.play()
                if(player.weaponSelected instanceof Piercer) player.weaponSelected = Weapons[1]
                else if(player.weaponSelected instanceof Shotgun) player.weaponSelected = Weapons[2]
                else if(player.weaponSelected instanceof RocketLauncher) player.weaponSelected = Weapons[0]
                keys["e"] = false
            },
            "q":()=>{
                console.log(overlap(pauseMenu.buttons[0], {pos:hover, scale:v(1)}))
                keys["q"] = false
            },
            "escape":()=>{
                pauseMenu.openMenu()
            }
        }

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
                        this.vel.x = Math.cos(a)*whip.retractSpeed*getDeltaTime()
                        this.vel.y = Math.sin(a)*whip.retractSpeed*getDeltaTime()
                    } else {
                        whip.target.vel.x = -Math.cos(a)*whip.retractSpeed*getDeltaTime()*10
                        whip.target.vel.y = -Math.sin(a)*whip.retractSpeed*getDeltaTime()*10
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
                console.log(this.whiplash.angle)
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
            let a = fetchAngle(this.middle, hoverVector)
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
    updateMovement() {
        if(player.noclip) {

        } else {
            let Y_INTERSECTION = undefined
            let X_INTERSECTION = undefined
            

            for(let obj of objects) {
                if(overlap(obj, this)&&obj.collision) {
                    Y_INTERSECTION = obj
                }
            }
            if(Y_INTERSECTION==undefined) player.pos.y += player.vel.y*getDeltaTime() 
            else {
                if(player.vel.y > 0) {
                    player.pos.y = Y_INTERSECTION.pos.y - player.scale.y - 0.1
                    player.onGround = true
                }
                else if(player.vel.y < 0) {
                    player.pos.y = Y_INTERSECTION.pos.y + Y_INTERSECTION.scale.y + 0.1
                    player.vel.y = 0
                }
            }

            for(let obj of objects) {
                if(overlap(obj, this)&&obj.collision) {
                    X_INTERSECTION = obj
                }
            }
            if(X_INTERSECTION==undefined) player.pos.x += player.vel.x*getDeltaTime() 
            else {
                if(player.vel.x > 0) {
                    player.pos.x = X_INTERSECTION.pos.x - player.scale.x - 0.1
                    player.vel.x = 0
                }
                else if(player.vel.x < 0) {
                    player.pos.x = X_INTERSECTION.pos.x + X_INTERSECTION.scale.x + 0.1
                    player.vel.x = 0
                }
            }

            
            
        }
    }
    update() {
        //this.updateMovement()
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
        this.hyperCooldown.current = Math.min(this.hyperCooldown.current+getDeltaTime(true), this.hyperCooldown.max)
        this.coinCooldown.current = Math.min(this.coinCooldown.current+getDeltaTime(true), this.coinCooldown.max)
        
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
function playerRespawn() {
    player = new Player()
}

var player = new Player()
export {player, Player, playerRespawn}