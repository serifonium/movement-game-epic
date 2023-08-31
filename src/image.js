class SpreadSheet {
    constructor(src, scale, pixelscale) {
        this.img = new Image()
        this.img.src = src
        this.scale = scale
        this.pscale = pixelscale
    }
    render(pos, ipos) {
        ctx.drawImage(this.img,ipos.x*this.pscale,ipos.y*this.pscale,this.pscale,this.pscale, pos.x, pos.y, this.pscale, this.pscale)
    }
}
let shotStyles = new SpreadSheet("./imgs/shotStyles.png", v(8, 8), 64)
let styleStyles = new SpreadSheet("./imgs/style.png", v(4, 4), 128)