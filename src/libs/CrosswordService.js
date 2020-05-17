import api from "./api.js"

class CrosswordService {

    async getAllCrosswords (userid) {
        if (this.crosswords === null || this.crosswords === undefined) {
            let response
            let requestSuccess = false
            try {
                console.log('Getting all crosswords...')
                response = await api.getAllCrosswords(userid)
                console.log(response)
                requestSuccess = response.status === 200
            } catch (error) {
                requestSuccess = false
            }

            if (requestSuccess) {
                this.crosswords = response.data.sort((a,b) => (a.date < b.date) ? 1 : -1)
                return this.crosswords
            }
        } else {
            return this.crosswords
        }
    }

    getAllLoadedCrosswords () {
        return this.crosswords
    }

    getCrosswordById (id) {
        return this.crosswords.find(c => c.id === id)
    }

    getCrosswordAttributesById (id) {
        let board = this.crosswords.find(c => c.id === id).board
        let grid = board.grid
        let total = 0
        let filled = 0
        let checked = false
        let revealed = false
        let complete = false
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[0].length; c++) {
                if (grid[r][c].value !== "_") {
                    if (grid[r][c].status === "Complete") {
                        complete = true
                    } else if (grid[r][c].status === "CheckedTrue" 
                                || grid[r][c].status === "PrevChecked"
                                || grid[r][c].status === "CheckedFalse") {
                        checked = true
                    } else if (grid[r][c].status === "Revealed") {
                        revealed = true
                    }
                    total++
                    if (grid[r][c].value !== "") {
                        filled++
                    }
                }
            }
        }
        let percent = (filled / total) * 100
        return {
            percent: percent,
            complete: complete,
            checked: checked,
            revealed: revealed,
            seconds: board.numSeconds
        }
    }
}

export default new CrosswordService()