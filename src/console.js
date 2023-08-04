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
    }
    CheckBase(0)
}