import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/LoginModal.css'
import api from '../libs/api.js'
import User from '../libs/User.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import UserValidation from '../libs/UserValidation'

class LoginModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: "",
            password: "",
            email: "",
            newAccount: true,
            forgotInfo: false,
            errorMessage: null
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
        this.handleEmailChange = this.handleEmailChange.bind(this)

        this.emailIsValid = this.emailIsValid.bind(this)
        this.passwordIsValid = this.passwordIsValid.bind(this)

        this.forgotInfo = this.forgotInfo.bind(this)
        this.loginClicked = this.loginClicked.bind(this)
        this.skipClicked = this.skipClicked.bind(this)
        this.createAccount = this.createAccount.bind(this)
        this.loginToAccount = this.loginToAccount.bind(this)

        this.cleanupStateAndLogin = this.cleanupStateAndLogin.bind(this)
    }

    emailIsValid () {
        let emailParts = this.state.email.split("@")
        let emailError = "Please enter a valid email address"
        if (emailParts.length !== 2 || emailParts[1].split(".").length !== 2) {
            this.setState({
                errorMessage: emailError
            })
            return false
        }
        return true
    }

    passwordIsValid () {
        if (this.state.password.trim().length < 6) {
            this.setState({
                errorMessage: "Password must be at least 6 characters"
            })
            return false
        }
        return true
    }

    usernameIsValid () {
        if (this.state.username.trim() === "") {
            this.setState({
                errorMessage: "Username cannot be empty"
            })
            return false
        }
        return true
    }

    handleUsernameChange (event) {
        this.setState({
            username: event.target.value
        });
    }

    handlePasswordChange (event) {
        this.setState({
            password: event.target.value
        });
    }

    handleEmailChange (event) {
        this.setState({
            email: event.target.value
        })
    }

    flipAccountFlag () {
        this.setState({
            newAccount: !this.state.newAccount,
            forgotInfo: false,
            errorMessage: null
        })
    }

    forgotInfo () {
        this.setState({
            forgotInfo: !this.state.forgotInfo
        })
    }

    loginClicked () {
        if (this.state.forgotInfo) {
            this.sendRecoveryEmail()
        } else {
            if (this.state.newAccount) {
                if (this.emailIsValid() && this.passwordIsValid() && this.usernameIsValid()) {
                    this.createAccount(this.state.email, this.state.username, this.state.password)
                }
            } else {
                this.loginToAccount()
            }
        }
    }

    skipClicked () {
        if (this.props.linking) {
            console.log("cancelling linking")
            this.cleanupStateAndLogin()
        } else {
            console.log("not cancelling linking")
            let rand4Digit = Math.floor(1000 + (Math.random() * 9000))
            let email = "guest" + rand4Digit + "@guest.com"
            let username = "Guest"
            let password = "guest" + rand4Digit
            this.createAccount(email, username, password)
        }
    }

    async createAccount (email, username, password) {
        let error = await UserValidation.createAccount(email, username, password, this.props.linking)
        if (error === "") {
            this.cleanupStateAndLogin()
        } else {
            this.setState({
                errorMessage: error
            })
        }
    }

    async loginToAccount () {
        let error = await UserValidation.loginToAccount(this.state.email, this.state.password)
        if (error === "") {
            this.cleanupStateAndLogin()
        } else {
            this.setState({
                errorMessage: error
            })
        }
    }

    cleanupStateAndLogin () {
        this.setState({
            username: "",
            password: "",
            email: "",
            newAccount: true,
            forgotInfo: false,
            errorMessage: null
        })
        this.props.onLogin(User)
    }

    render () {
        const { username, password, email, newAccount, forgotInfo, errorMessage } = this.state

        if (this.props.shouldShow) {
            return (
                <Fragment>
                    <div className="login-modal-wrapper">
                        <div className="login-header-top">
                            {newAccount ? "Create an account" : "Sign in"}
                        </div>
                        <div className="login-header-bottom">
                            { this.props.linking ? "Link your current games to an account to save progress across devices and customize settings." :
                                `${newAccount ? 
                                "Save your progress across devices and customize your settings." 
                                : "Get back to puzzling."}`
                            }
                        </div>
                        {this.props.linking ? <div className="login-modal-create"></div> :
                            <div className="login-modal-create" onClick={() => this.flipAccountFlag()}>
                                {newAccount ? "I already have an account." : "I need to create an account."}
                            </div>
                        }
                        <div className="login-modal">
                            <div className="login-forgot-info-prompt" style={{display: forgotInfo ? "" : "none"}}>
                                Enter your email to retrieve your info.
                            </div>
                            <div className="login-label">
                                <input className="login-input" type="text" placeholder="email" value={email} onChange={this.handleEmailChange} />
                            </div>
                            <div className="login-label" style={{display: newAccount && !forgotInfo ? "" : "none"}}>
                                <input className="login-input" type="text" placeholder="username" value={username} onChange={this.handleUsernameChange} />
                            </div>
                            <div className="login-label" style={{display: forgotInfo ? "none" : ""}}>
                                <input className="login-input" type="password" placeholder="password" value={password} onChange={this.handlePasswordChange} />
                            </div>
                            <div className="login-forgot-info" style={{display: newAccount ? "none" : ""}}
                                onClick={() => this.forgotInfo()}>
                                {forgotInfo ? "Nevermind, I remember." : "I forget my info."}
                            </div>
                            <div className="login-error-message" style={{display: errorMessage !== null ? "" : "none"}}>
                                <FontAwesomeIcon className="login-error-x" style={{display: errorMessage !== null ? "" : "none"}}
                                    icon={faTimes} onClick={() => this.setState({ errorMessage: null })}/>
                                {errorMessage}
                            </div>
                        </div>
                        <div className="login-footer">
                            <div className="login-footer-button-submit footer-btn" 
                                style={{width: forgotInfo ? "60%" : "", margin: forgotInfo ? "0 20%" : ""}} 
                                onClick={() => this.loginClicked()}>
                                {forgotInfo ? "Send email" : `${newAccount ? "Create" : "Login"}`}
                            </div>
                            <div className="login-footer-button-skip footer-btn" 
                                style={{display: forgotInfo ? "none" : ""}} onClick={() => this.skipClicked()}>
                                {this.props.linking ? "Cancel" : "Skip it"}
                            </div>
                        </div>
                    </div>
                </Fragment>
            )
        } else {
            return null
        }
    }
}

LoginModal.propTypes = {
    shouldShow: PropTypes.bool.isRequired,
    linking: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired
}

export default LoginModal