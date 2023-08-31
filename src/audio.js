class aAudio {
    constructor(src) {
        this.src = src
        this.audios = []
        this.threadNum = 4
        for(let i=0;i<=this.threadNum;i++) {
            this.audios.push(new Audio(this.src))
        }
        this.selected = 0
    }
    play() {
        this.audios[this.selected].play()
        this.selected++
        if(this.selected>this.threadNum) this.selected+=-this.threadNum
        //console.log(this,this.selected)
    }

}
var audioCache = {
    "punch":new aAudio("./audio/punch.wav"),
    "shotgun":new aAudio("./audio/shotgun.wav"),
    "coin":new aAudio("./audio/coin.wav"),
    "piercerShoot":new aAudio("./audio/piercerShoot.wav"),
    "weaponChange":new aAudio("./audio/weaponChange.wav"),
    "explosion":new aAudio("./audio/explosion.wav"),
}
