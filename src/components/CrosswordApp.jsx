import React, { StrictMode, Component } from 'react'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import LoginModal from './LoginModal.jsx'
import User from '../libs/User.js'
import api from '../libs/api.js'
import '../css/CrosswordApp.css'
import UserValidation from '../libs/UserValidation.js'

class CrosswordApp extends Component {
    constructor (props) {
        super(props)

        this.state = {
            loggedIn: false
        }

        this.miniPageSelected = this.miniPageSelected.bind(this)
        this.fullPageSelected = this.fullPageSelected.bind(this)
        this.onLogin = this.onLogin.bind(this)
        this.toHomeScreen = this.toHomeScreen.bind(this)
    }

    componentDidMount () {
        console.log("Validating user from crossword app home page")
        let user = UserValidation.validateUser()
        let validated = user.token !== null && user.email !== null && user.username !== null

        this.setState({
            loggedIn: validated
        })
    }

    toHomeScreen () {
        this.setState({
            minisChosen: false,
            fullsChosen: false,
            loggedIn: true
        })
    }

    miniPageSelected () {
        this.props.history.push('/minis')
    }

    fullPageSelected () {
        this.props.history.push('/crosswords')
    }

    onLogin (user) {
        console.log("Logged in user: " + user)
        User.email = user.email
        User.username = user.username
        User.token = user.token
        localStorage.setItem('user-token', user.token)
        localStorage.removeItem('link')
        localStorage.removeItem('logout')

        this.setState({
            loggedIn: true
        })
    }

    render () {
        const { loggedIn } = this.state

        let linkFlag = localStorage.getItem('link')
        const linking = linkFlag === 'true'

        let logoutFlag = localStorage.getItem('logout')
        const loggedOut = logoutFlag === 'true'

        let loginOpen = !loggedIn || linking || loggedOut

        return (
            <StrictMode>
                <LoginModal shouldShow={loginOpen} linking={linking} onLogin={this.onLogin} />
                <CrosswordNavBar blurred={loginOpen}/>
                <div className="crossword-app-overlay"
                    style={{display: `${loginOpen ? "" : "none"}`}}></div>
                <div className="crossword-app-wrapper" 
                    style={{filter: `${loginOpen ? "blur(5px)" : "none"}`}}>
                    <div className="crossword-app-option" onClick={() => this.fullPageSelected()}>
                        <div className="crossword-app-header">
                            Full-sized themers
                        </div>
                        <div className="crossword-app-body">
                            Solve some of the full-sized crosswords I've created, in both 15 x 15 (daily size) and 21 x 21 (Sunday size).
                        </div>
                    </div>
                    <div className="crossword-app-option" onClick={() => this.miniPageSelected()}>
                        <div className="crossword-app-header">
                            Generated minis
                        </div>
                        <div className="crossword-app-body">
                            Solve an unlimited supply of minis of varying sizes, with the fill and clues automatically generated anew each time.
                        </div>
                    </div>
                </div>
            </StrictMode>
        )
    }
}

export default CrosswordApp