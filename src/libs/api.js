import axios from 'axios'

const baseUrl = 'http://localhost:8080'
const axiosInstance = axios.create({
    baseURL: `${baseUrl}/api`,
    timeout: 3000
})
class api {
    

    /* USER APIS */
    createUser (email, user, pass) {
        return axiosInstance.post('/user/create', {email: email, username: user, password: pass})
    }

    linkAccount(token, email, user, pass) {
        return axiosInstance.put('/user/link', {token: token, newAccount: {email: email, username: user, password: pass}})
    }

    saveSettings(token, colorScheme, inactivityTimer, playSound) {
        return axiosInstance.put('/user/settings', 
            {userToken: token, settings: {colorScheme: colorScheme, inactivityTimer: inactivityTimer, playSound: playSound}}
        )
    }

    loginUser (email, pass) {
        return axiosInstance.post('/user/login', {email: email, password: pass})
    }

    validateUserFromToken (token) {
        return axiosInstance.post('/user/validate', {token: token})
    }

    /* CROSSWORDS APIS */
    getAllCrosswords () {
        return axiosInstance.get('/crossword/all')
    }

    getCrossword (id, userid) {
        return axiosInstance.get(`/crossword/${id}/${userid}`)
    }

    updateCrossword (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/update`, board)
    }

    crosswordIsComplete (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/isComplete`, board)
    }

    checkCrosswordSquare (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/check/square`, board)
    }

    checkCrosswordWord (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/check/word`, board)
    }

    checkCrosswordPuzzle (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/check/puzzle`, board)
    }

    revealCrosswordSquare (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/reveal/square`, board)
    }

    revealCrosswordWord (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/reveal/word`, board)
    }

    revealCrosswordPuzzle (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/reveal/puzzle`, board)
    }

    clearCrosswordPuzzle (id, userid, board) {
        return axiosInstance.put(`/crossword/${id}/${userid}/clear/puzzle`, board)
    }

    /* MINI APIS */
    generateMini (size, difficulty) {
        return axiosInstance.get(`/mini/${size}/${difficulty}/generate`, {timeout: 10000})
    }


}

export default new api()