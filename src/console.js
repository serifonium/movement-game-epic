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
        if(command[a] == "kill") {
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
    }
    CheckBase(0)
}

var startingComms = [
    //"/god",
]

for(let comm of startingComms) {
    consoleCommand(comm)
}