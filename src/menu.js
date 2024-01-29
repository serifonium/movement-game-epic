import { redText, whiteText } from "./image.js"
import { renderText } from "./render.js"
import { hover } from "./startup.js"

class Button {
    constructor(pos=v(64), scale=v(64), render=()=>{},customOptions) {
        let options = {
            onClick: () => {},
            ...customOptions
        }
        
        for(let key in options) {
            this[key] = options[key]
        }

        this.pos = pos
        this.scale = scale
        this.render = render
    }
}
class Menu {
    constructor(render, customOptions) {
        let options = {
            open: false,
            focus: false,
            render: () => {},
            update: () => {},
            buttons: [],
            ...customOptions
        }

        for(let key in options) {
            this[key] = options[key]
        }

        this.render = render
        this.renderButtons = (that) => {
            for(let button of that.buttons) {
                button.render(button)
            }
        }
    }
    openMenu() {
        this.open = true
        this.focus = true
    }
    closeMenu() {
        this.open = false
        this.focus = false
    }
}
var pauseMenu = new Menu((that)=>{
    //console.log("yeah")
    renderText("movement game epic", v(64, 64), undefined, 1, redText)
    
}, {
    buttons: [
        new Button(v(64, 160), v(64, 32), (that)=>{
            let textType = redText
            if(overlap({pos:hover, scale:v(1, 1)}, that)) textType = whiteText
            renderText("maps", that.pos, undefined, 0.5, textType)
        }), new Button(v(64, 160+40*1), v(128, 32), (that)=>{
            let textType = redText
            if(overlap({pos:hover, scale:v(1, 1)}, that)) textType = whiteText
            renderText("keybinds", that.pos, undefined, 0.5, textType)
        })
    ]
})

export {pauseMenu}