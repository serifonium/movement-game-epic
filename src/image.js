import {ctx} from "./startup.js"

class SpreadSheet {
    constructor(src, pixelscale, scale, keycodes) {
        this.img = new Image()
        this.img.src = src
        this.pscale = pixelscale
        this.scale = scale
        this.keycodes = keycodes
    }
    render(pos=v(0, 0), imagepos=v(0, 0), imagescale=v(1, 1)) {
        ctx.drawImage(this.img,
            imagepos.x*this.scale.x,
            imagepos.y*this.scale.y,
            this.scale.x,
            this.scale.y,
            pos.x, 
            pos.y, 
            this.scale.x*imagescale.x, 
            this.scale.y*imagescale.y
        )
    } 
    renderFromKeycodes(pos=v(0, 0), key, imagescale=v(1, 1)) {
        let imagepos = this.keycodes[key]
        ctx.drawImage(this.img,
            imagepos.x*this.scale.x,
            imagepos.y*this.scale.y,
            this.scale.x,
            this.scale.y,
            pos.x, 
            pos.y, 
            this.scale.x*imagescale.x, 
            this.scale.y*imagescale.y,
        )
    }
    renderCustomArea(pos=v(0, 0), imagepos=v(0, 0), scale=v(1, 1), imagescale=v(1, 1)) {
        ctx.drawImage(this.img,
            imagepos.x*this.scale.x,
            imagepos.y*this.scale.y,
            this.scale.x*scale.x,
            this.scale.y*scale.y,
            pos.x, 
            pos.y, 
            this.scale.x*imagescale.x*scale.x, 
            this.scale.y*imagescale.y*scale.y
        )
    } 
}
let textkeys = {
    "a":v(0, 0), "b":v(1, 0), "c":v(2, 0), "d":v(3, 0),
    "e":v(4, 0), "f":v(5, 0), "g":v(6, 0), "h":v(7, 0),
    "i":v(8, 0), "j":v(9, 0), "k":v(10, 0), "l":v(11, 0),
    "m":v(12, 0), "n":v(13, 0), "o":v(14, 0), "p":v(15, 0),
    "q":v(0, 1), "r":v(1, 1), "s":v(2, 1), "t":v(3, 1),
    "u":v(4, 1), "v":v(5, 1), "w":v(6, 1), "x":v(7, 1),
    "y":v(8, 1), "z":v(9, 1), "(":v(10, 1), ")":v(11, 1),
    "[":v(12, 1), "]":v(13, 1), "{":v(14, 1), "}":v(15, 1),

    "A":v(0, 2), "B":v(1, 2), "C":v(2, 2), "D":v(3, 2),
    "E":v(4, 2), "F":v(5, 2), "G":v(6, 2), "H":v(7, 2),
    "I":v(8, 2), "J":v(9, 2), "K":v(10, 2), "L":v(11, 2),
    "M":v(12, 2), "N":v(13, 2), "O":v(14, 2), "P":v(15, 2),
    "Q":v(0, 3), "R":v(1, 3), "S":v(2, 3), "T":v(3, 3),
    "U":v(4, 3), "V":v(5, 3), "W":v(6, 3), "X":v(7, 3),
    "Y":v(8, 3), "Z":v(9, 3), ".":v(10, 3), ",":v(11, 3),
    "/":v(12, 3), "?":v(13, 3), "'":v(14, 3), '"':v(15, 3),

    "1":v(0, 4), "2":v(1, 4), "3":v(2, 4), "4":v(3, 4),
    "5":v(4, 4), "6":v(5, 4), "7":v(6, 4), "8":v(7, 4),
    "9":v(8, 4), "0":v(9, 4), "+":v(10, 4), "-":v(11, 4),
    "\\":v(12, 4), "<":v(13, 4), ">":v(14, 4), "~":v(15, 4),
    "@":v(0, 5), "#":v(1, 5), "$":v(2, 5), "^":v(3, 5),
    "&":v(4, 5), ":":v(5, 5), ";":v(6, 5), "*":v(7, 5),
    //"Y":v(8, 5), "Z":v(9, 5), ".":v(10, 5), ",":v(11, 5),
    //"/":v(12, 5), "?":v(13, 5), "'":v(14, 5), '"':v(15, 5),

    " ":v(-1, 0),
}
let shotStyles = new SpreadSheet("./imgs/shotStyles.png", v(8, 8), v(64, 64))
let styleStyles = new SpreadSheet("./imgs/style.png", v(4, 4), v(128,128))
let weaponStyles = new SpreadSheet("./imgs/weapons.png", v(4, 4), v(128,64))
let watcherTexture = new SpreadSheet("./imgs/watcher.png", v(4, 4), v(128,128))
let fireTexture = new SpreadSheet("./imgs/fire.png", v(4, 4), v(64,64))
let redText = new SpreadSheet("./imgs/redText.png", v(4, 4), v(32,64), textkeys)
let whiteText = new SpreadSheet("./imgs/whiteText.png", v(4, 4), v(32,64), textkeys)
let ammoTypes = new SpreadSheet("./imgs/ammoTypes.png", v(4, 4), v(64, 64))
let uiOverlay = new SpreadSheet("./imgs/uiOverlay.png", v(4, 4), v(256, 256))

export {SpreadSheet, shotStyles, styleStyles, weaponStyles, watcherTexture, fireTexture, redText, whiteText, ammoTypes, uiOverlay}