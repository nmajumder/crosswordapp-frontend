import React, { StrictMode, Component } from 'react'
import ReactDOM from 'react-dom'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import LoginModal from './LoginModal.jsx'
import User from '../libs/User.js'
import api from '../libs/api.js'
import '../css/CrosswordApp.css'
import UserValidation from '../libs/UserValidation.js'
import fullSizedThemers from '../images/fullSizedThemers2.png'
import auto from '../images/auto.png'
import generated from '../images/generated.png'
import minis from '../images/minis.png'

class CrosswordApp extends Component {
    constructor (props) {
        super(props)

        this.overlayRef1 = React.createRef()
        this.overlayRef2 = React.createRef()
        this.overlayRef3 = React.createRef()

        this.state = {
            loggedIn: false
        }

        this.miniPageSelected = this.miniPageSelected.bind(this)
        this.fullPageSelected = this.fullPageSelected.bind(this)
        this.onLogin = this.onLogin.bind(this)
        this.toHomeScreen = this.toHomeScreen.bind(this)

        this.overlayHover = this.overlayHover.bind(this)
        this.overlayUnhover = this.overlayUnhover.bind(this)
    }

    async componentDidMount () {
        console.log("Validating user from crossword app home page")
        let user = await UserValidation.validateUser()
        let validated = user !== null && user.token !== null && user.email !== null && user.username !== null

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
        localStorage.removeItem('manage')
        localStorage.removeItem('logout')

        this.setState({
            loggedIn: true
        })
    }

    overlayHover () {
        this.overlayRef1.current.style.opacity = '.2'
        this.overlayRef2.current.style.opacity = '.2'
        this.overlayRef3.current.style.opacity = '.2'
    }

    overlayUnhover () {
        this.overlayRef1.current.style.opacity = '0'
        this.overlayRef2.current.style.opacity = '0'
        this.overlayRef3.current.style.opacity = '0'
    }

    render () {
        const { loggedIn } = this.state

        let linkFlag = localStorage.getItem('link')
        const linking = linkFlag === 'true'

        let manageFlag = localStorage.getItem('manage')
        const manage = manageFlag === 'true'

        let logoutFlag = localStorage.getItem('logout')
        const loggedOut = logoutFlag === 'true'

        let loginOpen = !loggedIn || linking || manage || loggedOut

        return (
            <StrictMode>
                <LoginModal shouldShow={loginOpen} linking={linking} manage={manage} onLogin={this.onLogin} />
                <CrosswordNavBar blurred={loginOpen}/>
                <div className="crossword-app-overlay"
                    style={{display: `${loginOpen ? "" : "none"}`}}></div>
                <div className="crossword-app-wrapper" 
                    style={{filter: `${loginOpen ? "blur(5px)" : "none"}`}}>
                    <div className="full-sized-themer-box">
                        <img className="full-sized-themer-icon" src={fullSizedThemers} alt="Full Sized Themers" />
                        <div className="full-sized-themer-icon-overlay"></div>
                    </div>
                    <div className="generated-mini-box" style={{height: window.innerWidth * .3}}>
                        <img className="auto-icon-img overlap-icon" src={auto} />
                        <img className="generated-icon-img overlap-icon" src={generated} />
                        <img className="minis-icon-img overlap-icon" src={minis} />
                        <div className="auto-icon-overlay overlap-icon-overlay" ref={this.overlayRef1} 
                            onMouseEnter={() => this.overlayHover()} onMouseLeave={() => this.overlayUnhover()}></div>
                        <div className="generated-icon-overlay overlap-icon-overlay" ref={this.overlayRef2} 
                            onMouseEnter={() => this.overlayHover()} onMouseLeave={() => this.overlayUnhover()}></div>
                        <div className="minis-icon-overlay overlap-icon-overlay" ref={this.overlayRef3} 
                            onMouseEnter={() => this.overlayHover()} onMouseLeave={() => this.overlayUnhover()}></div>
                    </div>
                </div>
            </StrictMode>
        )
    }
}

export default CrosswordApp