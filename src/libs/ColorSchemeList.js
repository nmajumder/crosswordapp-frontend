import ColorScheme from './ColorScheme.js'

class ColorSchemeList {
    constructor () {
        this.colorSchemes = [
            new ColorScheme("new-york-times", "Classic NYT", ["#ffeca0", "#ffda00", "#a7d8ff", "#3f84fb", "#3167c4"]),
            new ColorScheme("lilac-garden", "Lilac Garden", ["#ecffcf", "#C4E68D", "#dbb2db", "#914991", "#572c57"]),
            new ColorScheme("swimming-hole", "Swimming Hole", ["#cffcff", "#a3fff6", "#94d2ff", "#0b6bb0", "#074470"]),
            new ColorScheme("cappuccino", "Cappuccino", ["#f7e3d0", "#e0c3a8", "#cf9470", "#854442", "#522928"]),
            new ColorScheme("lemon-lime", "Lemon Lime", ["#f7ffb0", "#edff4a", "#a4e07b", "#64b05a", "#3d6b37"]),
            new ColorScheme("baby-shower", "Baby Shower", ["#ffdbf8", "#fcb6ef", "#98ddfa", "#53b3e6", "#38799c"]),
            new ColorScheme("sunset", "Sunset", ["#fff5ba", "#ffe44f", "#ffa45e", "#d44b19", "#822e10"])
        ]
    }
    
    findIndexByKey (key) {
        return this.colorSchemes.findIndex(x => x.key === key)
    } 
}

export default new ColorSchemeList()