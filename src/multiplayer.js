class Connection {
    constructor(address="http://0.0.0.0:4545") {
        this.conn = io(address)
        this.conn.on("connect", ()=>{
            console.log("connection")
            this.conn.on("returnSend", (e)=>{
                console.log(e)
            })
            this.conn.on("returnError", (e)=>{
                console.log(e)
            })
        })
    }
    open(id) {
        this.conn.emit("open", id)
    }
    join(id) {
        this.conn.emit("join", id)
    }
    send(data) {
        this.conn.emit("send", data)
    }
}