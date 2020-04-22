import React, { StrictMode, Component } from 'react'
import MiniCrosswordApp from './MiniCrosswordApp.jsx'
import FullCrosswordApp from './FullCrosswordApp.jsx'
import LoginPage from './LoginPage.jsx'
import '../css/CrosswordApp.css'

class CrosswordApp extends Component {
    constructor (props) {
        super(props)

        this.state = {
            minisChosen: false,
            fullsChosen: false,
            loginOpen: true
        }

        this.miniPageSelected = this.miniPageSelected.bind(this)
        this.fullPageSelected = this.fullPageSelected.bind(this)
        this.loginClosed = this.loginClosed.bind(this)
        this.toHomeScreen = this.toHomeScreen.bind(this)
    }

    toHomeScreen () {
        this.setState({
            minisChosen: false,
            fullsChosen: false,
            loginOpen: false
        })
    }

    miniPageSelected () {
        this.setState({
            minisChosen: true
        })
    }

    fullPageSelected () {
        this.setState({
            fullsChosen: true
        })
    }

    loginClosed () {
        this.setState({
            loginOpen: false
        })
    }

    render () {
        const { minisChosen, fullsChosen, loginOpen } = this.state
        const screenWidth = window.innerWidth + "px"
        const screenHeight = window.innerHeight + "px"

        if (minisChosen) {
            return (<MiniCrosswordApp backSelected={this.toHomeScreen} />)
        } else if (fullsChosen) {
            return (<FullCrosswordApp backSelected={this.toHomeScreen} />)
        } else {
            return (
                <StrictMode>
                    <div className="crossword-app-wrapper" style={{width: screenWidth, height: screenHeight}}>
                        <div className="crossword-app-option" onClick={() => this.fullPageSelected()}>
                            <div className="crossword-app-header">
                                Full-sized themers
                            </div>
                            <div className="crossword-app-body">
                                Work on some of the full-sized crosswords I've created, in both 15 x 15 (daily size) and 21 x 21 (Sunday size).
                            </div>
                        </div>
                        <div className="crossword-app-option" onClick={() => this.miniPageSelected()}>
                            <div className="crossword-app-header">
                                Generated minis
                            </div>
                            <div className="crossword-app-body">
                                Work on an unlimited supply of minis of varying sizes, with the fill and clues automatically generated anew each time.
                            </div>
                        </div>
                    </div>
                </StrictMode>
            )
        }
    }
}

CrosswordApp.propTypes = {}

export default CrosswordApp