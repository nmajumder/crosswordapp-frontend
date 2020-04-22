import ColorScheme from './ColorScheme.js'

class ColorSchemeList {
    constructor () {
        this.colorSchemes = [
            new ColorScheme("new-york-times", "Classic NYT", ["#ffeca0", "#ffda00", "#a7d8ff", "#3f84fb"]),
            new ColorScheme("lilac-garden", "Lilac Garden", ["#ecffcf","#C4E68D","#c8a2c8","#914991"]),
            new ColorScheme("swimming-hole", "Swimming Hole", ["#cffcff","#a3fff6","#94d2ff","#0b6bb0"]),
            new ColorScheme("cappuccino", "Cappuccino", ["#f7e3d0","#e0c3a8","#cf9470","#854442"]),
            new ColorScheme("lemon-lime", "Lemon Lime", ["#f7ffb0", "#edff4a", "#a4e07b", "#64b05a"]),
            new ColorScheme("baby-shower", "Baby Shower", ["#ffdbf8", "#fcb6ef", "#98ddfa", "#53b3e6"]),
            new ColorScheme("sunset", "Sunset", ["#fff5ba","#ffe44f", "#ffa45e", "#d44b19"])
        ]
    }
}

export default new ColorSchemeList()