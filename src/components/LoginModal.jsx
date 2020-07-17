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
            newAccount: false,
            forgotInfo: false,
            errorMessage: null,
            newPassword: "",
            sentEmail: false,
            loading: false
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
        this.handleEmailChange = this.handleEmailChange.bind(this)
        this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this)

        this.emailIsValid = this.emailIsValid.bind(this)
        this.passwordIsValid = this.passwordIsValid.bind(this)

        this.forgotInfo = this.forgotInfo.bind(this)
        this.loginClicked = this.loginClicked.bind(this)
        this.skipClicked = this.skipClicked.bind(this)
        this.createAccount = this.createAccount.bind(this)
        this.loginToAccount = this.loginToAccount.bind(this)
        this.sendRecoveryEmail = this.sendRecoveryEmail.bind(this)

        this.cleanupStateAndLogin = this.cleanupStateAndLogin.bind(this)

        this.onKeyDown = this.onKeyDown.bind(this)
    }

    componentDidMount () {
        document.addEventListener("keydown", this.onKeyDown, false)
    }

    componentWillUnmount () {
        document.removeEventListener("keydown", this.onKeyDown, false)
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

    newPasswordIsValid () {
        if (this.state.newPassword.trim().length < 6) {
            this.setState({
                errorMessage: "New password must be at least 6 characters"
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
        } else if (this.state.username.length < 6) {
            this.setState({
                errorMessage: "Username must be at least 6 characters"
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

    handleNewPasswordChange (event) {
        this.setState({
            newPassword: event.target.value
        })
    }

    flipAccountFlag () {
        this.setState({
            newAccount: !this.state.newAccount,
            forgotInfo: false,
            errorMessage: null,
            sentEmail: false
        })
    }

    forgotInfo () {
        this.setState({
            forgotInfo: !this.state.forgotInfo,
            sentEmail: false
        })
    }

    loginClicked () {
        this.setState({
            errorMessage: null
        })
        if (this.state.forgotInfo) {
            this.sendRecoveryEmail()
        } else if (this.props.manage) {
            if (this.newPasswordIsValid()) {
                this.changePassword()
            }
        } else if (this.props.linking || this.state.newAccount) {
            if (this.emailIsValid() && this.passwordIsValid() && this.usernameIsValid()) {
                this.createAccount(this.state.email, this.state.username, this.state.password)
            }
        } else {
            this.loginToAccount()
        }
    }

    async skipClicked () {
        if (this.props.linking) {
            this.cleanupStateAndLogin()
        } else {
            let currentUser = await UserValidation.validateUser()
            if (currentUser !== null && currentUser.token !== null && currentUser.email !== null && currentUser.password !== null) {
                this.cleanupStateAndLogin()
            } else {
                let rand4Digit = Math.floor(1000 + (Math.random() * 9000))
                let email = "guest" + rand4Digit + "@guest.com"
                let username = "Guest" + rand4Digit
                let password = "guest" + rand4Digit
                this.createAccount(email, username, password)
            }
        }
    }

    async createAccount (email, username, password) {
        this.setState({
            loading: true
        })
        let error = await UserValidation.createAccount(email, username, password, this.props.linking)
        if (error === "") {
            this.cleanupStateAndLogin()
        } else {
            this.setState({
                errorMessage: error
            })
        }
        this.setState({
            loading: false
        })
    }

    async loginToAccount () {
        this.setState({
            loading: true
        })
        let error = await UserValidation.loginToAccount(this.state.email, this.state.password)
        if (error === "") {
            this.cleanupStateAndLogin()
        } else {
            this.setState({
                errorMessage: error
            })
        }
        this.setState({
            loading: false
        })
    }

    async changePassword () {
        this.setState({
            loading: true
        })
        let error = await UserValidation.changePassword(this.state.password, this.state.newPassword)
        if (error === "") {
            this.cleanupStateAndLogin()
        } else {
            this.setState({
                errorMessage: error
            })
        }
        this.setState({
            loading: false
        })
    }

    async sendRecoveryEmail () {
        this.setState({
            loading: true
        })
        let error = await UserValidation.resetPassword(this.state.email)
        if (error === "") {
            this.setState({
                sentEmail: true
            })
        } else {
            this.setState({
                errorMessage: error
            })
        }
        this.setState({
            loading: false
        })
    }

    cleanupStateAndLogin () {
        this.setState({
            username: "",
            password: "",
            email: "",
            newAccount: false,
            forgotInfo: false,
            errorMessage: null,
            newPassword: "",
            sentEmail: false
        })
        this.props.onLogin(User)
    }

    onKeyDown (event) {
        if (event.which === 13) {
            event.preventDefault()
            this.loginClicked()
        }
    }

    render () {
        const { username, password, email, newAccount, forgotInfo, errorMessage, newPassword, sentEmail, loading } = this.state

        if (this.props.shouldShow) {
            if (this.props.linking) {
                return (
                    <Fragment>
                        <div className="login-modal-wrapper">
                            <div className="login-header-top">Create an account</div>
                            <div className="login-header-bottom">
                                Link your current games to an account to save progress across devices and customize settings.
                            </div>
                            <div className="login-modal-create"></div>
                            <div className="login-modal">
                                <div className="login-label">
                                    <input className="login-input" type="text" placeholder="email" value={email} onChange={this.handleEmailChange} />
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="text" placeholder="public username" value={username} onChange={this.handleUsernameChange} />
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="password" placeholder="password" value={password} onChange={this.handlePasswordChange} />
                                </div>
                                <div className="login-error-message" style={{display: errorMessage !== null ? "" : "none"}}>
                                    <FontAwesomeIcon className="login-error-x" style={{display: errorMessage !== null ? "" : "none"}}
                                        icon={faTimes} onClick={() => this.setState({ errorMessage: null })}/>
                                    {errorMessage}
                                </div>
                                <div className="login-loading-message" style={{display: loading ? "" : "none"}}>
                                    Loading...
                                </div>
                            </div>
                            <div className="login-footer">
                                <div className="login-footer-button-submit footer-btn" disabled={loading} onClick={() => this.loginClicked()}>Create</div>
                                <div className="login-footer-button-skip footer-btn" disabled={loading} onClick={() => this.skipClicked()}>Cancel</div>
                            </div>
                        </div>
                    </Fragment>
                )
            } else if (this.props.manage) {
                return (
                    <Fragment>
                        <div className="login-modal-wrapper">
                            <div className="login-header-top">Change password</div>
                            <div className="login-modal">
                                <div className="login-change-password-field">
                                    <span className="login-change-password-header">Email:</span><span>{User.email}</span>
                                </div>
                                <div className="login-change-password-field">
                                    <span className="login-change-password-header">User:</span><span>{User.username}</span>
                                </div>
                                <div className="login-change-password-prompt">
                                    Please enter your current password and the password you wish to use.
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="password" placeholder="current password" value={password} onChange={this.handlePasswordChange} />
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="password" placeholder="new password" value={newPassword} onChange={this.handleNewPasswordChange} />
                                </div>
                                <div className="login-error-message" style={{display: errorMessage !== null ? "" : "none"}}>
                                    <FontAwesomeIcon className="login-error-x" style={{display: errorMessage !== null ? "" : "none"}}
                                        icon={faTimes} onClick={() => this.setState({ errorMessage: null })}/>
                                    {errorMessage}
                                </div>
                                <div className="login-loading-message" style={{display: loading ? "" : "none"}}>
                                    Loading...
                                </div>
                            </div>
                            <div className="login-footer">
                                <div className="login-footer-button-submit footer-btn" disabled={loading} onClick={() => this.loginClicked()}>Confirm</div>
                                <div className="login-footer-button-skip footer-btn" disabled={loading} onClick={() => this.skipClicked()}>Cancel</div>
                            </div>
                        </div>
                    </Fragment>
                )
            } else if (forgotInfo) {
                return (
                    <Fragment>
                        <div className="login-modal-wrapper">
                            <div className="login-header-top">Sign in</div>
                            <div className="login-header-bottom">Get back to puzzling.</div>
                            <div className="login-modal-create" onClick={() => this.flipAccountFlag()}>I need to create an account.</div>
                            <div className="login-modal">
                                <div className="login-forgot-info-prompt">Enter your email to retrieve your info.</div>
                                <div className="login-label">
                                    <input className="login-input" type="text" placeholder="email" value={email} onChange={this.handleEmailChange} />
                                </div>
                                <div className="login-error-message" style={{display: errorMessage !== null ? "block" : "none"}}>
                                    <FontAwesomeIcon className="login-error-x" style={{display: errorMessage !== null ? "" : "none"}}
                                        icon={faTimes} onClick={() => this.setState({ errorMessage: null })}/>
                                    {errorMessage}
                                </div>
                                <div className="login-error-message" style={{display: sentEmail ? "block" : "none", color: "green"}}>
                                    Success, check your email for a temporary passcode.
                                </div>
                                <div className="login-forgot-info" onClick={() => this.forgotInfo()}>
                                    {sentEmail ? "Back to login" : "Nevermind, I remember."}
                                </div>
                                <div className="login-loading-message" style={{display: loading ? "" : "none"}}>
                                    Loading...
                                </div>
                            </div>
                            <div className="login-footer">
                                <div className="login-footer-button-submit footer-btn" 
                                    style={{width: "60%", margin: "0 20%"}} disabled={loading} onClick={() => this.loginClicked()}>
                                    Send email
                                </div>
                            </div>
                        </div>
                    </Fragment>
                )
            } else if (newAccount) {
                return (
                    <Fragment>
                        <div className="login-modal-wrapper">
                            <div className="login-header-top">Create an account</div>
                            <div className="login-header-bottom">Save your progress across devices and customize your settings.</div>
                            <div className="login-modal-create" onClick={() => this.flipAccountFlag()}>I already have an account.</div>
                            <div className="login-modal">
                                <div className="login-label">
                                    <input className="login-input" type="text" placeholder="email" value={email} onChange={this.handleEmailChange} />
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="text" placeholder="public username" value={username} onChange={this.handleUsernameChange} />
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="password" placeholder="password" value={password} onChange={this.handlePasswordChange} />
                                </div>
                                <div className="login-error-message" style={{display: errorMessage !== null ? "" : "none"}}>
                                    <FontAwesomeIcon className="login-error-x" style={{display: errorMessage !== null ? "" : "none"}}
                                        icon={faTimes} onClick={() => this.setState({ errorMessage: null })}/>
                                    {errorMessage}
                                </div>
                                <div className="login-loading-message" style={{display: loading ? "" : "none"}}>
                                    Loading...
                                </div>
                            </div>
                            <div className="login-footer">
                                <div className="login-footer-button-submit footer-btn" disabled={loading} onClick={() => this.loginClicked()}>Create</div>
                                <div className="login-footer-button-skip footer-btn" disabled={loading} onClick={() => this.skipClicked()}>Skip it</div>
                            </div>
                        </div>
                    </Fragment>
                )
            } else {
                return (
                    <Fragment>
                        <div className="login-modal-wrapper">
                            <div className="login-header-top">Sign in</div>
                            <div className="login-header-bottom">Get back to puzzling.</div>
                            <div className="login-modal-create" onClick={() => this.flipAccountFlag()}>I need to create an account</div>
                            <div className="login-modal">
                                <div className="login-label">
                                    <input className="login-input" type="text" placeholder="email" value={email} onChange={this.handleEmailChange} />
                                </div>
                                <div className="login-label">
                                    <input className="login-input" type="password" placeholder="password" value={password} onChange={this.handlePasswordChange} />
                                </div>
                                <div className="login-forgot-info" onClick={() => this.forgotInfo()}>I forget my info.</div>
                                <div className="login-error-message" style={{display: errorMessage !== null ? "" : "none"}}>
                                    <FontAwesomeIcon className="login-error-x" style={{display: errorMessage !== null ? "" : "none"}}
                                        icon={faTimes} onClick={() => this.setState({ errorMessage: null })}/>
                                    {errorMessage}
                                </div>
                                <div className="login-loading-message" style={{display: loading ? "" : "none"}}>
                                    Loading...
                                </div>
                            </div>
                            <div className="login-footer">
                                <div className="login-footer-button-submit footer-btn" disabled={loading} onClick={() => this.loginClicked()}>
                                    Login
                                </div>
                                <div className="login-footer-button-skip footer-btn" disabled={loading}onClick={() => this.skipClicked()}>
                                    Skip it
                                </div>
                            </div>
                        </div>
                    </Fragment>
                )
            }
        } else {
            return null
        }
    }
}

LoginModal.propTypes = {
    shouldShow: PropTypes.bool.isRequired,
    linking: PropTypes.bool.isRequired,
    manage: PropTypes.bool.isRequired,
    onLogin: PropTypes.func.isRequired
}

export default LoginModal