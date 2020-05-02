import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { withRouter, useLocation } from 'react-router-dom'
import '../css/CrosswordNavBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
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
        this.logout = this.logout.bind(this)
    }

    componentDidMount () {
        if (this.props.location.pathname === "/") {
            return
        }
        console.log("Validating user from nav bar")
        let user = UserValidation.validateUser()
        let validated = user.token !== null && user.email !== null && user.username !== null
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

    logout () {
        User.logout()
        localStorage.removeItem('user-token')
        localStorage.setItem('logout', 'true')
        this.props.history.push('/')
    }

    render () {
        return (
            <Fragment>
                <div className="nav-full-page-overlay" style={{display: this.state.dropdownOpen ? "" : "none"}}></div>
                <div className="crossword-nav-bar" 
                    style={{display: `${this.props.hidden ? "none" : ""}`, filter: `${this.props.blurred ? "blur(5px)" : "none"}`}}>
                    <div className="nav-home-button nav-button" onClick={() => this.props.history.push('/')}>
                        Home
                    </div>
                    <div className="nav-crosswords-button nav-button" 
                        onClick={() => this.props.history.push({pathname: '/crosswords', home: true})}>
                        Crosswords
                    </div>
                    <div className="nav-minis-button nav-button" onClick={() => this.props.history.push('/minis')}>
                        Minis
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
                                            Create an account to sync your progress.
                                        </div>
                                    </div> :
                                    <div className="nav-account-dropdown-profile-body">
                                        <div>Email: {User.email}</div>
                                        <div className="nav-account-dropdown-link" onClick={() => this.logout()}>Log out.</div>
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
                                    <div className="nav-account-dropdown-settings-row">
                                        <span className="nav-account-dropdown-settings-row-title">Play Sound: </span>
                                        <span style={{fontWeight: "700"}}>{Settings.playSound ? "On" : "Off"}</span>
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