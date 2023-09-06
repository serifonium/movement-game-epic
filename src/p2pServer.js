/*

=================To create objects============
Use 
new Host()
to create a host for comms, use
Host.open([id])
to open incoming connections on id

--> THIS ID IS ONLY A TEMPORAY CONNECTION UNTILL THE CLIENTS GET MOVED TO A PERMANENT ONE <--

Use
new Client([id])
to automatically to find and connect to host of that temporay id.

A host can have a many clients as you want
Clients can only have one host

=============To send data=============
On Host
Host.send([id], [data])
or to send to all clients
Host.broadcast([data])

a list of clients can be found at Host.clients

On Client
Client.send([data])
... thats it, it's that easy


*/

const PEER_SERVER_ADDRESS = "http://0.0.0.0:4545"  //  <---- this should be the local IP of the peer server

class Connection {
    constructor(address=Connection.peerServerAddress) {
        this.conn = io(address)

        this.connected = false

        this.debug = true
        this.log = (e)=>{if(this.debug)console.log(e)}

        let defaultCallback = (e)=>{if(this.debug)console.log(e)}

        this.id = undefined


        this.e = {
            data:defaultCallback,
            connection:defaultCallback,
            paired:defaultCallback,
            unpaired:defaultCallback,
            opening:defaultCallback,
            error:defaultCallback,
            disconnect:defaultCallback,
        }


        this.conn.on("connect", ()=>{
            this.log("connection")
            this.connected = true
            this.conn.on("returnSend", (e)=>{
                this.e.data(e)
            })
            this.conn.on("returnError", (e)=>{
                this.log(e)
                this.e.error(e)
            })
            this.e.connection()

            this.conn.on("opening", (e)=>{
                this.e.opening(e)
            })
            this.conn.on("paired", (e)=>{
                this.e.paired(e)
            })
            this.conn.on("unpaired", (e)=>{
                this.e.unpaired(e)
            })

        })

        

    }

    static peerServerAddress = PEER_SERVER_ADDRESS


    disconnect() {
        this.log("connection manually disarticulated")
        this.conn.disconnect()
    }
    open(id) {
        this.conn.emit("open", id)
        this.id = id
    }
    join(id) {
        this.conn.emit("join", id)
        this.id = id
    }
    send(data) {
        this.conn.emit("send", data)
    }
}

class Multiplayer {
    constructor(){
        this.clientId = `${Math.random()}`

        this.debug = true

        this.events = {}
    }
    log(str) {
        if(this.debug)console.log(str)
    }
    on(name, callback) {
        this.events[name] = callback
    }
}

class Host extends Multiplayer {
    constructor() {
        super()

        this.connectionConn = new Connection()

        this.clients = {}
    }
    broadcast(name, data) {
        for (let i = 0; i < Object.keys(this.clients).length; i++) {
            const client = this.clients[Object.keys(this.clients)[i]]
            this.send(client.id, name, data)
            
        }
    }
    send(id, name, data) {
        if (this.clients[id]) {
            if (this.clients[id].connected) {
                this.clients[id].send(JSON.stringify({
                    name:name,
                    data:data,
                }))
            }
        }
    }
    addClient() {
        let newId = ([...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')),
            newConn = new Connection()

        
        newConn.open(newId)
        newConn.e.data = (e)=>{
            let data = JSON.parse(e)
            if (this.events[data.name]) {
                this.events[data.name](newConn.id, JSON.parse(data.data))
            }
        }
        newConn.e.unpaired = ()=>{
            if (this.events["disconnect"]) {
                this.events["disconnect"](newConn.id)
            }
        }
        this.clients[newConn.id] = newConn

        return newConn
    }
    init(id) {
        this.clientId = id
        this.connectionConn.e.paired = ()=>{

            let newClient = this.addClient()
            newClient.e.opening = ()=>{
                this.log(this)
                this.log(newClient.id)
                this.connectionConn.send(newClient.id)
            }

            
        }

        this.connectionConn.open(id)
        
    }
}

class Client extends Multiplayer {
    constructor(id) {
        super()

        this.connected = false

        this.connectionConn = new Connection()

        this.mainConn = new Connection()
        this.mainConn.e.data = (e)=>{
            console.log("yay")
            let data = JSON.parse(e)
            if (this.events[data.name]) {
                this.events[data.name](this.mainConn.id, JSON.parse(data.data))
            }
        }
        this.mainConn.e.unpaired = ()=>{
            if (this.events["disconnect"]) {
                this.events["disconnect"](this.mainConn.id)
            }
        }

        this.connectionConn.e.data = (e)=>{
            this.log(e)
            this.clientId = e
            this.mainConn.join(e)
            this.connectionConn.disconnect()
        }
        this.connectionConn.join(id)
    }
    send(name, data) {
        if (this.mainConn.connected) this.mainConn.send(JSON.stringify({
            name:name,
            data:data,
        }))
    }
}