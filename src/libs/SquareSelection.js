class SquareSelection {
    constructor (row, col, dir) {
        this.coords = [row,col]
        this.direction = dir
    }

    flipDirection () {
        this.direction === "Across" ? this.direction = "Down" : this.direction = "Across"
    }

    isBefore (otherSquare) {
        if (this.coords[0] < otherSquare.coords[0]) return true
        if (this.coords[0] > otherSquare.coords[0]) return false
        if (this.coords[1] < otherSquare.coords[1]) return true
        return false
    }
}

export default SquareSelection