import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { withRouter, useLocation } from 'react-router-dom'
import '../css/CrosswordNavBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import crosswordinfinityinverted from '../images/crosswordinfinityinverted.png'
import User from '../libs/User.js'
import UserValidation from '../libs/UserValidation'
import Settings from '../libs/Settings'

class CrosswordNavBar extends Component {
    constructor(props) {
        super(props)

        this.state = {
            dropdownOpen: false
        }

        this.toggleDropdownOpen = this.toggleDropdownOpen.bind(this)
        this.linkAccount = this.linkAccount.bind(this)
        this.loginExisting = this.loginExisting.bind(this)
        this.manageAccount = this.manageAccount.bind(this)
        this.logout = this.logout.bind(this)
    }

    async componentDidMount () {
        if (this.props.location.pathname === "/" 
                || this.props.location.pathname === "/crosswords" 
                || this.props.location.pathname === "/stats") {
            return
        }
        console.log("Validating user from nav bar")
        let user = await UserValidation.validateUser()
        let validated = user !== null && user.token !== null && user.email !== null && user.username !== null
        if (validated) {
            if (this.props.loggedIn) this.props.loggedIn()
        } else {
            this.props.history.push('/')
        }
    }

    toggleDropdownOpen (isOpen) {
        this.setState({
            dropdownOpen: isOpen
        })
    }

    linkAccount () {
        localStorage.setItem('link', 'true')
        this.props.history.push('/')
    }

    loginExisting () {
        localStorage.setItem('logout', 'true')
        this.props.history.push('/')
    }

    manageAccount () {
        localStorage.setItem('manage', 'true')
        this.props.history.push('/')
    }

    logout () {
        User.logout()
        localStorage.removeItem('user-token')
        localStorage.setItem('logout', 'true')
        this.props.history.push('/')
    }

    render () {
        const homePage = "/"
        const crosswordsPage = "/crosswords"
        const minisPage = "/minis"
        const statsPage = "/stats"
        const leaderboardPage = "/leaderboard"
        const suggestionsPage = "/suggestions"

        const curPage = this.props.location.pathname

        const selectedStyle = {backgroundColor: "#306acf"}

        return (
            <Fragment>
                <div className="nav-full-page-overlay" style={{display: this.state.dropdownOpen ? "" : "none"}}></div>
                <div className="crossword-nav-bar" 
                    style={{display: `${this.props.hidden ? "none" : ""}`, filter: `${this.props.blurred ? "blur(5px)" : "none"}`,
                            pointerEvents: `${this.props.blurred ? "none" : ""}`}}>
                    <div className="nav-home-button nav-button" 
                        style={curPage === homePage ? selectedStyle : {}}
                        onClick={() => this.props.history.push(homePage)}>
                        <img className="nav-home-logo" src={crosswordinfinityinverted} />
                    </div>
                    <div className="nav-crosswords-button nav-button nav-wide-button" 
                        style={curPage === crosswordsPage ? selectedStyle : {}}
                        onClick={() => this.props.history.push({pathname: crosswordsPage, home: true})}>
                        Crosswords
                    </div>
                    <div className="nav-minis-button nav-button nav-narrow-button" 
                        style={curPage === minisPage ? selectedStyle : {}}
                        onClick={() => this.props.history.push(minisPage)}>
                        Minis
                    </div>
                    <div className="nav-stats-button nav-button nav-narrow-button" 
                        style={curPage === statsPage ? selectedStyle : {}}
                        onClick={() => this.props.history.push(statsPage)}>
                        Stats
                    </div>
                    <div className="nav-leaderboard-button nav-button nav-wide-button" 
                        style={curPage === leaderboardPage ? selectedStyle : {}}
                        onClick={() => this.props.history.push(leaderboardPage)}>
                        Leaderboard
                    </div>
                    <DropdownButton id="nav-account-dropdown"
                        title={<FontAwesomeIcon style={{color: "white"}} icon={faUser} />}
                        onToggle={(isOpen, event, metadata) => { this.toggleDropdownOpen(isOpen) }}>
                        <Dropdown.Item className="nav-account-dropdown-body">
                            <div className="nav-account-dropdown-profile">
                                <div>
                                    <span style={{fontSize: "14pt"}}>Hello, </span>
                                    <span style={{fontWeight: "600", fontSize: "14pt"}}>{User.username}</span>
                                </div>
                                { User.email === null || User.email.includes("@guest.com") ? 
                                    <div className="nav-account-dropdown-profile-body">
                                        <div>You are not signed in.</div>
                                        <div className="nav-account-dropdown-link" onClick={() => this.linkAccount()}>
                                            Create an account to sync your progress
                                        </div>
                                        <div className="nav-account-dropdown-link bottom-link" onClick={() => this.loginExisting()}>
                                            Login to an existing account
                                        </div>
                                    </div> :
                                    <div className="nav-account-dropdown-profile-body">
                                        <div>Email: {User.email}</div>
                                        <div className="nav-account-dropdown-link" onClick={() => this.manageAccount()}>Change password</div>
                                        <div className="nav-account-dropdown-link bottom-link" onClick={() => this.logout()}>Log out</div>
                                    </div>
                                }
                            </div>
                            <div className="nav-account-dropdown-separator"></div>
                            <div className="nav-account-dropdown-settings">
                                <div className="nav-account-dropdown-settings-header">Crossword Settings</div>
                                <div className="nav-account-dropdown-settings-subtitle">
                                    Click the settings icon on any puzzle to modify.
                                </div>
                                <div className="nav-account-dropdown-settings-body">
                                    <div className="nav-account-dropdown-settings-row">
                                        <span className="nav-account-dropdown-settings-row-title">Color Scheme: </span>
                                        <span style={{fontWeight: "800", color: Settings.colorScheme.colors[3]}}>{Settings.colorScheme.displayName}</span>
                                    </div>
                                    <div className="nav-account-dropdown-settings-row">
                                        <span className="nav-account-dropdown-settings-row-title">Inactivity Timer: </span>
                                        <span style={{fontWeight: "700"}}>{Settings.timerInactivity === 0 ? "Off" : Settings.timerInactivity + " seconds"}</span>
                                    </div>
                                </div>
                            </div>
                        </Dropdown.Item>
                    </DropdownButton>
                </div>
            </Fragment>
        )
    }
}

CrosswordNavBar.propTypes = {
    hidden: PropTypes.bool,
    blurred: PropTypes.bool,
    loggedIn: PropTypes.func
}

export default withRouter(CrosswordNavBar)