class CrosswordKeyActions {
    alphaNumeric (grid, selection, key, completed) {
        let [r, c] = [selection.rowCoord, selection.colCoord]
        let boardSize = grid.length
        let wasEmpty = grid[r][c].value === ""
        if (!completed && this.canBeChanged(grid[r][c])) {
            grid[r][c].value = key
            if (grid[r][c].status === "CheckedFalse") {
                grid[r][c].status = "PrevChecked"
            }
        }
        if (selection.direction === "Across") {
            if (wasEmpty || c+1 === boardSize || grid[r][c+1].value === "_") {
                // find next open square in the word with wrapping
                let newCoords = this.getNextEmptySpaceWrapping(grid, selection)
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
                let newCoords = this.getNextEmptySpaceWrapping(grid, selection)
                if (newCoords !== null) {
                    selection.rowCoord = newCoords[0]
                    selection.colCoord = newCoords[1]
                }
            } else {
                // go to next square
                selection.rowCoord = r+1
            }
        }
    }

    delete (grid, selection, completed) {
        let [r, c] = [selection.rowCoord, selection.colCoord]
        let moveAndDelete = completed || grid[r][c].value === "" || !this.canBeChanged(grid[r][c])
        if (selection.direction === "Across" && moveAndDelete && c-1 >= 0 && grid[r][c-1].value !== "_") {
            // move left a square and delete if able
            if (!completed && this.canBeChanged(grid[r][c-1])) {
                grid[r][c-1].value = ""
            }
            selection.colCoord = c-1
        } else if (selection.direction === "Down" && moveAndDelete && r-1 >= 0 && grid[r-1][c].value !== "_") {
            // move up a square and delete if able
            if (!completed && this.canBeChanged(grid[r-1][c])) {
                grid[r-1][c].value = ""
            }
            selection.rowCoord = r-1
        } else {
            // delete this square if able and stay put
            if (!completed && this.canBeChanged(grid[r][c])) {
                grid[r][c].value = ""
            }
        }
        if (grid[selection.rowCoord][selection.colCoord].status === "CheckedFalse") {
            grid[selection.rowCoord][selection.colCoord].status = "PrevChecked"
        }
    }

    tabOrEnter (grid, selection, shiftKey, acrossClues, downClues, completed) {
        let allClues = acrossClues.concat(downClues)
        let clueInd = allClues.findIndex(c => selection.direction === "Across"
                ? grid[selection.rowCoord][selection.colCoord].acrossClueNum === c.number && c.direction === "Across"
                : grid[selection.rowCoord][selection.colCoord].downClueNum === c.number && c.direction === "Down")
        let foundCoords = null
        let newDirection = null
        if (shiftKey) {
            // going backwards
            if (completed || this.gridIsFull(grid)) {
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
            if (completed || this.gridIsFull(grid)) {
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
    }

    leftArrow (grid, selection) {
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
    }

    upArrow (grid, selection) {
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
    }

    rightArrow (grid, selection) {
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
    }

    downArrow (grid, selection) {
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
    }

    canBeChanged (square) {
        return square.status !== "Revealed" && square.status !== "CheckedTrue"
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

    getNextEmptySpaceWrapping (grid, selection) {
        let [r, c] = [selection.rowCoord, selection.colCoord]
        if (selection.direction === "Across") {
            do {
                c++
                if (c >= grid.length || grid[r][c].value === "_") {
                    console.log("Found end of an across word at " + r + "," + c);
                    console.log("Last letter had across word ind of " + grid[r][c-1].acrossWordIndex);
                    // go to beginning of word
                    c = c - grid[r][c-1].acrossWordIndex - 1
                    console.log("Moved back to " + r + "," + c);
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