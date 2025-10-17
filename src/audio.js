class aAudio {
    constructor(src, volume=1) {
        this.src = src
        this.audios = []
        this.threadNum = 4
        for(let i=0;i<=this.threadNum;i++) {
            this.audios.push(new Audio(this.src))
            this.audios[this.audios.length - 1].volume = volume
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
    "shotgun":new aAudio("./audio/shotgun.wav", 0.8),
    "coin":new aAudio("./audio/coin.wav", 0.3),
    "piercerShoot":new aAudio("./audio/piercerShoot.wav"),
    "weaponChange":new aAudio("./audio/weaponChange.wav", 0.4),
    "explosion":new aAudio("./audio/explosion.wav", 0.4),
    "rocketShoot":new aAudio("./audio/rocketShoot.wav")
}

export {aAudio, audioCache}