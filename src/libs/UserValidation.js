import User from './User.js'
import Settings from './Settings.js'
import api from './api.js'
import CrosswordService from './CrosswordService.js'
import MiniStatsService from './MiniStatsService.js'

class UserValidation {
    async validateUser() {
        if (User.token !== null) {
            if (User.email === null || User.username === null) {
                console.log("Must validate bc no email or username")
                return await this.validateUserFromToken(User.token)
            }
        } else {
            let userToken = localStorage.getItem('user-token')
            console.log(userToken)
            if (userToken !== null && userToken !== "null") {
                console.log("Must validate bc token found in local storage")
                return await this.validateUserFromToken(userToken)
            }
        }
        return User
    }

    async validateUserFromToken (userToken) {
        let response
        let requestSuccess
        try {
            console.log('Validating user token... ' + userToken)
            response = await api.validateUserFromToken(userToken)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess && response.data.success) {
            this.setLoggedInUserData(response.data.user)
            return User
        } else {
            User.token = null
            localStorage.removeItem('user-token')
            return null
        }
    }

    async loginToAccount (email, password) {
        let response
        let requestSuccess = false
        try {
            console.log('Loggin in user... ' + email)
            response = await api.loginUser(email, password)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            return "Error validating password."
        } else if (!response.data.success) {
            if (response.data.error.includes("email")) {
                return "No account found with this email."
            } else if (response.data.error.includes("password")) {
                return "Incorrect password for this account."
            }
        } else {
            this.setLoggedInUserData(response.data.user)
            return ""
        }
    }

    async createAccount (email, username, password, linkAccount) {
        let response
        let requestSuccess = false
        try {
            if (linkAccount) {
                console.log("Attempting to link guest account... " + email + ", " + username)
                response = await api.linkAccount(User.token, email, username, password)
            } else {
                console.log('Creating user... ' + email + ", " + username)
                response = await api.createUser(email, username, password)
            }
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            return "Error creating account."
        } else if (!response.data.success) {
            if (response.data.error.includes("email")) {
                return "There is already an account associated with this email."
            } else if (response.data.error.includes("account error")) {
                return "There was an error linking your guest account to your new info."
            }
        } else {
            this.setLoggedInUserData(response.data.user)
            return ""
        }
    }

    async changeUsername (newUsername) {
        let response
        let requestSuccess = false
        try {
            response = await api.changeUsername(User.token, User.email, newUsername)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            return "Error processing username change request"
        } else if (!response.data.success) {
            return "Unable to validate your account data to change username"
        } else {
            User.username = newUsername
            return ""
        }
    }

    async changePassword (oldPassword, newPassword) {
        let response
        let requestSuccess = false
        try {
            response = await api.changePassword(User.email, oldPassword, newPassword)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            return "Error processing password change request."
        } else if (!response.data.success) {
            return "Incorrect password for this account."
        } else {
            User.password = newPassword
            return ""
        }
    }

    async resetPassword (email) {
        let response
        let requestSuccess = false
        try {
            response = await api.resetPassword(email)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            return "Error resetting password"
        } else if (!response.data.success) {
            return "Email not recognized"
        } else {
            return ""
        }
    }

    setLoggedInUserData (user) {
        User.email = user.email
        User.username = user.username
        User.token = user.token
        Settings.setSettingsFromUserCall(user.settings)
        CrosswordService.logoutCrosswords()
        MiniStatsService.logoutStats()
    }
}

export default new UserValidation()