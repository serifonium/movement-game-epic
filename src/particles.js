import {ctx} from "./startup.js"

class ParticleHandler {
    constructor() {
        this.particles = []
        this.physicsParticles = []
    }
 
    spawnParticle(pos, vel, options, physics=false) {
        /*-
        Spawns a single particle
 
        pos = position
        vel = movement velocity (NO DRAG)
 
        shape =
            list of vertices and their distance from the particle origin, equally spaced apart
        */
        this[physics ? ("physicsParticles") : ("particles")].push({
            pos:{...pos},
            vel:{...vel},
 
 
            options:{
 
                timeLeft:4,
 
                gravity:0.4,
                colour:"#6a0",
 
                shape:[10,10,10,10],
                scale:1,
                rotation:Math.PI*2*Math.random(),
 
               
 
                ...options,
            }
        })
    }
 
    burstParticles(pos, num, size, options, pOptions) {
        options = {
            angle:0,
 
            duration:3,
 
            angleRange:360,
            speed:50,
 
            colour:"#0a0",
            colourRange:0.4,
 
            ...options,
        }
        num = Math.round(num*(0.9+(Math.random()*0.2)))
 
        for (let i = 0; i < num; i++) {
 
            let angle = (
                        options.angleRange*(0.5-Math.random()) + options.angle
                        ) * (Math.PI/180),
                speed = options.speed * (0.5 + (Math.random()*0.5))
 
            let pVel = v(Math.cos(angle)*speed, Math.sin(angle)*speed)
 
 
            let polygon = []
            for (let i = 0; i < randInt(3,5); i++) {
                polygon.push(2+Math.random()*13)
            }
 
            pOptions = {
                ...pOptions,
 
                timeLeft:options.duration,
 
                colour:pSBC(options.colourRange*(Math.random()-0.5), options.colour),
 
                scale:0.2+Math.random()*0.4,
                shape:polygon,
            }
 
            this.spawnParticle(pos, pVel, pOptions)
        }
 
    }
 
    updateParticles(dt) {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
 
            particle.options.timeLeft -= dt
 
            if (particle.options.timeLeft<=0) {
                this.particles.splice(i,1)
            }
 
 
            particle.pos.x += particle.vel.x*dt
            particle.pos.y += particle.vel.y*dt
 
        }
    }
 
 
 
    renderParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
           
            let pos = particle.pos,
                polygonVerts = particle.options.shape,
                componentForm = (d, a) => {return v(pos.x+Math.cos(a)*d, pos.y+Math.sin(a)*d)}
 
 
            let r = particle.options.rotation
 
            ctx.save()
 
            ctx.beginPath()
           
            let startV = componentForm(polygonVerts[0]*particle.options.scale,r)
            ctx.moveTo(startV.x, startV.y)
 
 
            for (let i = 1; i < polygonVerts.length; i++) {
                const vert = polygonVerts[i];
 
                r+=((Math.PI*2)/polygonVerts.length)
 
                let v = componentForm(vert,r)
                ctx.lineTo(v.x, v.y)
 
            }
           
            ctx.closePath()
           
 
            let fadedPeirod = 0.3
            ctx.globalAlpha = Math.min(particle.options.timeLeft, fadedPeirod)/fadedPeirod
 
            ctx.fillStyle = particle.options.colour
            ctx.fill()
 
            ctx.restore()
 
        }
    }
}

var particleHandler = new ParticleHandler()
export {ParticleHandler, particleHandler}