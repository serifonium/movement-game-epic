import {player} from "./player.js"
import {objects} from "./startup.js"
import {Hitbox, NoCollisionHitbox, Item, ItemStool, Explosion, Coin, ProjectileBomb, World, CustomTextObject, StyleText, Trigger, GrindHandler, CombatText, PlatformHitbox} from "./classes.js"
import {Enemy, Drone, Virtue, Idol, Watcher, Bullet} from "./enemies.js"

var consoleOpen = false
var consoleLine = "/"
var consoleHistory = []

function openConsole(reverse=false) {
    if(reverse) consoleOpen = false
    else consoleOpen = true
}
function addToConsoleHistory(line) {
    consoleHistory.push(line)
}
function resetConsoleLine() {
    consoleLine = "/"
}

function enterConsoleKey(key) {
    if(key=="Backspace") {consoleLine=consoleLine.substring(0, consoleLine.length-1)}
    else if(key=="Space") consoleLine += " "
    else if(key=="Shift") {}
    else if(key=="Enter") {}
    else if(key=="Meta") {}
    else if(key=="Alt") {}
    else if(key=="Control") {}
    else if(key=="ArrowUp") {if(consoleHistory[consoleHistory.length-1]){consoleLine = consoleHistory[consoleHistory.length-1]}}
    else if(key=="ArrowDown") {}
    else if(key=="ArrowLeft") {}
    else if(key=="ArrowRight") {}
    else if(key=="Escape") {openConsole(true)}
    else consoleLine += key
}

function consoleCommand(command) {
    command = command.slice(1, command.length)
    command = command.split(" ")
    console.log(command)
    function CheckBase(a) {
        if(command[a] == "spawn") {
            function spawn(c) {
                if(command[a+2]&&command[a+3])objects.push(new c(v(Number(command[a+2]),Number(command[a+3]))))
                else objects.push(new c())
            }
            if(command[a+1]=="Drone") spawn(Drone)
            if(command[a+1]=="Husk") spawn(Husk)
            if(command[a+1]=="Virtue") spawn(Virtue)
        }
        if(command[a] == "loop") {
            for(let i=0;i<command[a+1];i++){
                CheckBase(a+2)
                //console.log("rep")
            }
        }
        if(command[a] == "infstam") {
            setInterval(()=>{
                player.stam = 3
            }, 1000/60)
        }
        if(command[a] == "god") {
            player.god = !player.god
        }
        if(command[a] == "wave") {
            if(command[a+1]) {
                let handler = null
                objects.forEach((obj)=>{
                    if(obj instanceof GrindHandler)handler=obj
                })
                if(handler){handler.wave = command[a+1];console.log("e")}
            }
        }
        if(command[a] == "killall") {
            for(let i=0;i<10;i++) {
                for(let o in objects) {
                    if(objects[o] instanceof Enemy) {
                        objects[o].remove()
                        o += -1
                    }
                }
            }
        }
        if(command[a] == "noclip") {
            player.noclip = !player.noclip
        }
        if(command[a] == "opendoors") {
            let removeableItems = []
            for(let o in objects) {
                obj = objects[o]
                if(obj instanceof ItemStool) {
                    obj.active = true
                    obj.onActivation()
                }
                if(obj instanceof Item) {
                    removeableItems.push(o)
                }
            }
            for(let o in removeableItems) {
                removeableItems[o].remove()
            }
        }
        if(command[a] == "help"||command[a] == "?") {
            consoleHistory.push("/god","/noclip","/killall","/spawn","/opendoors","/wave","/infstam","/loop")
        }
        if(command[a] == "gamespeed") {
            GAME_SPEED = command[a+1]
        }
    }
    CheckBase(0)
}

var startingComms = [
    //"/god",
]

for(let comm of startingComms) {
    consoleCommand(comm)
}

export {consoleCommand, consoleHistory, consoleOpen, openConsole, consoleLine, enterConsoleKey, addToConsoleHistory, resetConsoleLine}