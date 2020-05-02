import User from './User.js'
import Settings from './Settings.js'
import api from './api.js'

class UserValidation {
    validateUser() {
        if (User.token !== null) {
            if (User.email === null || User.username === null) {
                console.log("Must validate bc no email or username")
                return this.validateUserFromToken(User.token)
            }
        } else {
            let userToken = localStorage.getItem('user-token')
            console.log(userToken)
            if (userToken !== null && userToken !== "null") {
                console.log("Must validate bc token found in local storage")
                return this.validateUserFromToken(userToken)
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
            requestSuccess = true
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess && response.data.success) {
            User.email = response.data.user.email
            User.username = response.data.user.username
            User.token = response.data.user.token
            Settings.setSettingsFromUserCall(response.data.user.settings)
            return User
        } else {
            return null
        }
    }

    async loginToAccount (email, password) {
        let response
        let requestSuccess = false
        try {
            console.log('Loggin in user... ' + email)
            response = await api.loginUser(email, password)
            requestSuccess = true
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
            User.email = response.data.user.email
            User.username = response.data.user.username
            User.token = response.data.user.token
            Settings.setSettingsFromUserCall(response.data.user.settings)
            return ""
        }
    }

    async createAccount (email, username, password, linkAccount) {
        console.log("current email: " + User.email)
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
            requestSuccess = true
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            return "Error linking account."
        } else if (!response.data.success) {
            if (response.data.error.includes("email")) {
                return "There is already an account associated with this email."
            } else if (response.data.error.includes("account error")) {
                return "There was an error linking your guest account to your new info."
            }
        } else {
            User.email = response.data.user.email
            User.username = response.data.user.username
            User.token = response.data.user.token
            Settings.setSettingsFromUserCall(response.data.user.settings)
            return ""
        }
    }

}

export default new UserValidation()