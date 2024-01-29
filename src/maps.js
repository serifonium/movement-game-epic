import {whiteText, redText} from "./image.js"
import {Watcher, Drone, Idol, Virtue} from "./enemies.js"
import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox} from "./classes.js"

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
    //new PlatformHitbox(v(-500, -200), v(400, 50)),
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

export {grind, earth1, tutorial}