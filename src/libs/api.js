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

    changePassword (email, oldPassword, newPassword) {
        return axiosInstance.put('/user/password', {email: email, password: oldPassword, newPassword: newPassword})
    }

    resetPassword (email) {
        return axiosInstance.put('/user/password/reset', {email: email})
    }

    /* CROSSWORDS APIS */
    getAllCrosswords (userid) {
        return axiosInstance.get(`/crossword/${userid}/all`)
    }

    getAllRatings () {
        return axiosInstance.get('/crossword/ratings')
    }

    rateCrossword (id, userid, board) {
        return axiosInstance.post(`/crossword/${id}/${userid}/rate`, board)
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
        return axiosInstance.put(`/crossword/${id}/${userid}/reset`, board)
    }

    /* MINI APIS */
    generateMini (userid, size, difficulty) {
        return axiosInstance.get(`/mini/${userid}/${size}/${difficulty}/generate`, {timeout: 12000})
    }

    miniIsComplete (userid, board) {
        return axiosInstance.put(`/mini/${userid}/isComplete`, board)
    }

    checkMiniSquare (userid, board) {
        return axiosInstance.put(`/mini/${userid}/check/square`, board)
    }

    checkMiniWord (userid, board) {
        return axiosInstance.put(`/mini/${userid}/check/word`, board)
    }

    checkMiniPuzzle (userid, board) {
        return axiosInstance.put(`/mini/${userid}/check/puzzle`, board)
    }

    revealMiniSquare (userid, board) {
        return axiosInstance.put(`/mini/${userid}/reveal/square`, board)
    }

    revealMiniWord (userid, board) {
        return axiosInstance.put(`/mini/${userid}/reveal/word`, board)
    }

    revealMiniPuzzle (userid, board) {
        return axiosInstance.put(`/mini/${userid}/reveal/puzzle`, board)
    }

    /* STATS APIS */
    getMiniStats (userid) {
        return axiosInstance.get(`/mini/${userid}/stats`)
    }

    /* LEADERBOARD APIS */
    getLeaderboard (userid) {
        return axiosInstance.get(`/mini/${userid}/leaderboard`)
    }
}

export default new api()