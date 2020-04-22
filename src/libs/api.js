import axios from 'axios'

const baseUrl = 'http://localhost:8080'
class api {
    createUser (user, pass) {
        return axios.post(`${baseUrl}/api/user/create`, {username: user, password: pass})
    }

    getAllUsers () {
        return axios.get(`${baseUrl}/api/user/all`)
    }

    getUser (id) {
        return axios.get(`${baseUrl}/api/user/${id}`)
    }

    getAllCrosswords () {
        return axios.get(`${baseUrl}/api/crossword/all`)
    }

    getCrossword (id, userid) {
        return axios.get(`${baseUrl}/api/crossword/${id}/${userid}`)
    }

    updateCrossword (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}`, board)
    }

    crosswordIsComplete (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/isComplete`, board)
    }

    checkCrosswordSquare (id, userid, board) {
        console.log("checking square at " + board.selection.rowCoord + "," + board.selection.colCoord)
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/check/square`, board)
    }

    checkCrosswordWord (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/check/word`, board)
    }

    checkCrosswordPuzzle (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/check/puzzle`, board)
    }

    revealCrosswordSquare (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/reveal/square`, board)
    }

    revealCrosswordWord (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/reveal/word`, board)
    }

    revealCrosswordPuzzle (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/reveal/puzzle`, board)
    }

    clearCrosswordWord (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/clear/word`, board)
    }

    clearCrosswordPuzzle (id, userid, board) {
        return axios.put(`${baseUrl}/api/crossword/${id}/${userid}/clear/puzzle`, board)
    }
}

export default new api()