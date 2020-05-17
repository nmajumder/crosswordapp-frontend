import SquareSelection from "./SquareSelection"

class BoardStatus {
    constructor (board) {
        this.selection = new SquareSelection(board.selection.rowCoord, board.selection.colCoord, board.selection.direction)

        this.grid = []
        for (let r = 0; r < board.grid.length; r++) {
            this.grid.push([])
            for (let c = 0; c < board.grid[r].length; c++) {
                this.grid[r].push(board.grid[r][c].value)
            }
        }
    }

    shouldBeUpdated (grid, selection) {
        if (selection.rowCoord !== this.selection.coords[0] ||
            selection.colCoord !== this.selection.coords[1] ||
            selection.direction !== this.selection.direction) {
                return true;
        }

        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (this.grid[r][c] !== grid[r][c].value) {
                    return true
                }
            }
        }
        return false
    }

    updateBoardStatus (grid, selection) {
        this.selection.coords = [selection.rowCoord, selection.colCoord]
        this.selection.direction = selection.direction

        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                this.grid[r][c] = grid[r][c].value
            }
        }
    }
}

export default BoardStatus