import SquareSelection from "./SquareSelection"

class BoardStatus {
    constructor (board) {
        this.selection = new SquareSelection(board.rowCoord, board.colCoord, board.direction)
        this.numSeconds = board.numSeconds

        this.grid = []
        for (let r = 0; r < board.grid.length; r++) {
            this.grid.push([])
            for (let c = 0; c < board.grid[r].length; c++) {
                this.grid[r].push(board.grid[r][c].value)
            }
        }
    }

    shouldBeUpdated (board) {
        if (board.selection.rowCoord !== this.selection.coords[0] ||
            board.selection.colCoord !== this.selection.coords[1] ||
            board.selection.direction !== this.selection.direction) {
                return true;
        }

        for (let r = 0; r < board.grid.length; r++) {
            for (let c = 0; c < board.grid[r].length; c++) {
                if (this.grid[r][c] !== board.grid[r][c].value) {
                    return true
                }
            }
        }
        return false
    }

    updateBoardStatus (board) {
        this.selection.coords = [board.selection.rowCoord, board.selection.colCoord]
        this.selection.direction = board.selection.direction
        this.numSeconds = board.numSeconds

        for (let r = 0; r < board.grid.length; r++) {
            for (let c = 0; c < board.grid[r].length; c++) {
                this.grid[r][c] = board.grid[r][c].value
            }
        }
    }
}

export default BoardStatus