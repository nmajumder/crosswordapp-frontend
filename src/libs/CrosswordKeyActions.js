class CrosswordKeyActions {
    alphaNumeric (board, key) {
        let grid = board.grid
        let selection = board.selection
        let [r, c] = [selection.rowCoord, selection.colCoord]
        let boardSize = grid.length
        let wasEmpty = grid[r][c].value === ""
        grid[r][c].value = key
        if (selection.direction === "Across") {
            if (wasEmpty || c+1 === boardSize || grid[r][c+1].value === "_") {
                // find next open square in the word with wrapping
                let newCoords = this.getNextEmptySpaceWrapping(board)
                if (newCoords !== null) {
                    selection.rowCoord = newCoords[0]
                    selection.colCoord = newCoords[1]
                }
            } else {
                // go to next square
                selection.colCoord = c+1
            }
        } else {
            if (wasEmpty || r+1 === boardSize || grid[r+1][c].value === "_") {
                // find next open square in the word with wrapping
                let newCoords = this.getNextEmptySpaceWrapping(board)
                if (newCoords !== null) {
                    selection.rowCoord = newCoords[0]
                    selection.colCoord = newCoords[1]
                }
            } else {
                // go to next square
                selection.rowCoord = r+1
            }
        }
        return selection
    }

    delete (board) {
        let grid = board.grid
        let selection = board.selection
        let [r, c] = [selection.rowCoord, selection.colCoord]
        let boardSize = grid.length
        let wasEmpty = grid[r][c].value === ""
        if (selection.direction === "Across") {
            if (wasEmpty && c-1 >= 0 && grid[r][c-1].value !== "_") {
                // move left a square and delete
                grid[r][c-1].value = ""
                selection.colCoord = c-1
            } else {
                // delete this square and stay put
                grid[r][c].value = ""
            }
        } else {
            if (wasEmpty && r-1 >= 0 && grid[r-1][c].value !== "_") {
                // move up a square and delete
                grid[r-1][c].value = ""
                selection.rowCoord = r-1
            } else {
                // delete this square and stay put
                grid[r][c].value = ""
            }
        }
        return selection
    }

    tabOrEnter (board, shiftKey, acrossClues, downClues) {
        let grid = board.grid
        let selection = board.selection
        let allClues = acrossClues.concat(downClues)
        let clueInd = allClues.findIndex(c => selection.direction === "Across"
                ? grid[selection.rowCoord][selection.colCoord].acrossClueNum === c.number && c.direction === "Across"
                : grid[selection.rowCoord][selection.colCoord].downClueNum === c.number && c.direction === "Down")
        let foundCoords = null
        let newDirection = null
        if (shiftKey) {
            // going backwards
            if (this.gridIsFull(grid)) {
                // return beginning of prev word
                clueInd--
                if (clueInd < 0) {
                    clueInd += allClues.length
                }
                newDirection = allClues[clueInd].direction
                selection.rowCoord = allClues[clueInd].rowCoord
                selection.colCoord = allClues[clueInd].colCoord
            } else {
                // find empty square in previous word
                while (foundCoords === null) {
                    console.log("On clue: " + allClues[clueInd].number + " " + allClues[clueInd].direction)
                    clueInd--
                    if (clueInd < 0) {
                        clueInd += allClues.length
                    }
                    newDirection = allClues[clueInd].direction
                    foundCoords = this.getFirstEmptySpace(grid, allClues[clueInd])
                }
                selection.rowCoord = foundCoords[0]
                selection.colCoord = foundCoords[1]
            }
        } else {
            // going forwards
            if (this.gridIsFull(grid)) {
                clueInd++
                if (clueInd >= allClues.length) {
                    clueInd -= allClues.length
                }
                newDirection = allClues[clueInd].direction
                selection.rowCoord = allClues[clueInd].rowCoord
                selection.colCoord = allClues[clueInd].colCoord
            } else {
                // find empty square in next word
                while (foundCoords === null) {
                    console.log("On clue: " + allClues[clueInd].number + " " + allClues[clueInd].direction)
                    clueInd++
                    if (clueInd >= allClues.length) {
                        clueInd -= allClues.length
                    }
                    newDirection = allClues[clueInd].direction
                    foundCoords = this.getFirstEmptySpace(grid, allClues[clueInd])
                }
                selection.rowCoord = foundCoords[0]
                selection.colCoord = foundCoords[1]
            }
        }
        selection.direction = newDirection
        return selection
    }

    leftArrow (board) {
        let grid = board.grid
        let selection = board.selection
        if (selection.direction === "Down") {
            selection.direction = "Across"
        } else {
            let boardSize = grid.length
            let [r, c] = [selection.rowCoord, selection.colCoord]
            c--
            if (c < 0) {
                c += boardSize
                r--
                if (r < 0) {
                    r += boardSize
                }
            }
            while (grid[r][c].value === "_") {
                c--
                if (c < 0) {
                    c += boardSize
                    r--
                    if (r < 0) {
                        r += boardSize
                    }
                }
            }
            selection.rowCoord = r
            selection.colCoord = c
        }
        return selection
    }

    upArrow (board) {
        let grid = board.grid
        let selection = board.selection
        if (selection.direction === "Across") {
            selection.direction = "Down"
        } else {
            let boardSize = grid.length
            let [r, c] = [selection.rowCoord, selection.colCoord]
            r--
            if (r < 0) {
                r += boardSize
                c--
                if (c < 0) {
                    c += boardSize
                }
            }
            while (grid[r][c].value === "_") {
                r--
                if (r < 0) {
                    r += boardSize
                    c--
                    if (c < 0) {
                        c += boardSize
                    }
                }
            }
            selection.rowCoord = r
            selection.colCoord = c
        }
        return selection
    }

    rightArrow (board) {
        let grid = board.grid
        let selection = board.selection
        if (selection.direction === "Down") {
            selection.direction = "Across"
        } else {
            let boardSize = grid.length
            let [r, c] = [selection.rowCoord, selection.colCoord]
            c++
            if (c >= boardSize) {
                c -= boardSize
                r++
                if (r >= boardSize) {
                    r -= boardSize
                }
            }
            while (grid[r][c].value === "_") {
                c++
                if (c >= boardSize) {
                    c -= boardSize
                    r++
                    if (r >= boardSize) {
                        r -= boardSize
                    }
                }
            }
            selection.rowCoord = r
            selection.colCoord = c
        }
        return selection
    }

    downArrow (board) {
        let grid = board.grid
        let selection = board.selection
        if (selection.direction === "Across") {
            selection.direction = "Down"
        } else {
            let boardSize = grid.length
            let [r, c] = [selection.rowCoord, selection.colCoord]
            r++
            if (r >= boardSize) {
                r -= boardSize
                c++
                if (c >= boardSize) {
                    c -= boardSize
                }
            }
            while (grid[r][c].value === "_") {
                r++
                if (r >= boardSize) {
                    r -= boardSize
                    c++
                    if (c >= boardSize) {
                        c -= boardSize
                    }
                }
            }
            selection.rowCoord = r
            selection.colCoord = c
        }
        return selection
    }

    gridIsFull (grid) {
        let boardSize = grid.length
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (grid[r][c].value === "") {
                    return false
                }
            }
        }
        return true
    }

    getFirstEmptySpace (grid, clue) {
        let [row,col] = [clue.rowCoord, clue.colCoord]
        if (clue.direction === "Across") {
            for (let i = col; i < col + clue.answerLength; i++) {
                if (grid[row][i].value === "") {
                    return [row,i]
                }
            }
        } else {
            for (let i = row; i < row + clue.answerLength; i++) {
                if (grid[i][col].value === "") {
                    return [i,col]
                }
            }
        }
        return null
    }

    getNextEmptySpaceWrapping (board) {
        let grid = board.grid
        let selection = board.selection 
        let [r, c] = [selection.rowCoord, selection.colCoord]
        if (selection.direction === "Across") {
            do {
                c++
                if (c >= grid.length || grid[r][c].value === "_") {
                    // go to beginning of word
                    c = c - grid[r][c-1].acrossWordIndex - 1
                }
                if (grid[r][c].value === "") {
                    return [r,c]
                }
            } while (c !== selection.colCoord)
        } else {
            do {
                r++
                if (r >= grid.length || grid[r][c].value === "_") {
                    // go to beginning of word
                    r = r - grid[r-1][c].downWordIndex - 1
                }
                if (grid[r][c].value === "") {
                    return [r,c]
                }
            } while (r !== selection.rowCoord)
        }
        return null
    }
}

export default new CrosswordKeyActions()