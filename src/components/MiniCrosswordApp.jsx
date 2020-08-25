import React, { Fragment, Component } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PropTypes from 'prop-types'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import CrosswordBoardApp from './CrosswordBoardApp.jsx'
import SettingsModal from './SettingsModal.jsx'
import MessageModal from './MessageModal.jsx'
import Timer from './Timer.jsx'
import CrosswordKeyActions from '../libs/CrosswordKeyActions.js'
import Settings from '../libs/Settings.js'
import '../css/CrosswordPage.css'
import '../css/MiniCrosswordApp.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faPause, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faLightbulb } from '@fortawesome/free-regular-svg-icons'
import api from '../libs/api.js'
import User from '../libs/User.js'
import MiniStatsService from '../libs/MiniStatsService.js'
import Footer from './Footer.jsx'

class Square {
    constructor(val) {
        this.value = val
    }
}

class Board {
    constructor(size) {
        this.size = size
        this.grid = []
        for (let r = 0; r < size; r++) {
            this.grid.push([])
            for (let c = 0; c < size; c++) {
                this.grid[r].push(new Square(""))
            }
        }
        this.blacks = []
    }

    setRandomGrid () {
        for (let j = 0; j < this.blacks.length; j++) {
            this.grid[Math.floor(this.blacks[j] / this.size)][this.blacks[j] % this.size].value = ""
        }
        this.blacks = []
        let numBlack = this.size * 2 - 4
        for (let i = 0; i < numBlack; i++) {
            let rand = Math.floor(Math.random() * this.size * this.size)
            this.blacks.push(rand)
            this.grid[Math.floor(rand / this.size)][rand % this.size].value = "_"
        }
    }
}

class MiniCrosswordApp extends Component {
    constructor(props) {
        super(props)

        this.topRef = React.createRef()
        this.scrollRef = React.createRef()

        this.inactivityTimer = Settings.timerInactivity

        this.modalInfos = {
            "startPuzzle":["Ready to get started?", "Let's Go"],
            "pauseManual":["Your game has been paused", "Resume"],
            "pauseInactive":["Your game has been paused due to inactivity", "Resume"],
            "resetClicked":["Are you sure you want to reset the puzzle? This will clear the board but not the timer.", "Reset", "Cancel"],
            "puzzleCorrect":["Congratulations, you've solved the puzzle in {}! Want to play another?", "Let's do it", "Not yet"],
            "puzzleIncorrect":["Oops, there are still one or more errors to fix", "Close"]
        }
        this.doneMsg = ""

        this.acrossClues = []
        this.downClues = []
        this.timerKey = (new Date()).getTime()
        this.timerVal = 0

        this.state = {
            size: 5,
            difficulty: "Standard",
            mini: null,
            board: new Board(5),
            animationTimer: -1,
            complete: false,
            settings: Settings,
            modalInfo: [],
            generating: false,
            generateDisabled: true,
            generationError: false,
            settingsClicked: false,
            windowSize: window.innerWidth,
            loading: true
        }

        this.idleReset = this.idleReset.bind(this)
        this.handleWindowResize = this.handleWindowResize.bind(this)
        this.toggleDropdownVisibility = this.toggleDropdownVisibility.bind(this)
        this.settingsClicked = this.settingsClicked.bind(this)
        this.saveSettings = this.saveSettings.bind(this)
        this.closeSettings = this.closeSettings.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.pauseClicked = this.pauseClicked.bind(this)
        this.pauseInactive = this.pauseInactive.bind(this)
        this.crosswordFinished = this.crosswordFinished.bind(this)
        this.crosswordUnfinished = this.crosswordUnfinished.bind(this)
        this.getTimerValue = this.getTimerValue.bind(this)
        this.checkForCompletion = this.checkForCompletion.bind(this)
        this.getSelectedSquare = this.getSelectedSquare.bind(this)
        this.loadSettings = this.loadSettings.bind(this)

        this.checkSquareClicked = this.checkSquareClicked.bind(this)
        this.checkWordClicked = this.checkWordClicked.bind(this)
        this.checkPuzzleClicked = this.checkPuzzleClicked.bind(this)

        this.revealSquareClicked = this.revealSquareClicked.bind(this)
        this.revealWordClicked = this.revealWordClicked.bind(this)
        this.revealPuzzleClicked = this.revealPuzzleClicked.bind(this)

        this.resetPuzzleClicked = this.resetPuzzleClicked.bind(this)
        this.resetPuzzle = this.resetPuzzle.bind(this)

        this.onKeyDown = this.onKeyDown.bind(this)
        this.getWhichNumFromKey = this.getWhichNumFromKey.bind(this)
        this.clueClicked = this.clueClicked.bind(this)
        this.boardSquareClicked = this.boardSquareClicked.bind(this)

        this.handleSizeClick = this.handleSizeClick.bind(this)
        this.handleDifficultyClick = this.handleDifficultyClick.bind(this)
        this.generateMini = this.generateMini.bind(this)

        this.startBoardAnimation = this.startBoardAnimation.bind(this)
        this.stopBoardAnimation = this.stopBoardAnimation.bind(this)
    }

    componentDidMount () {
        window.addEventListener('resize', this.handleWindowResize)
        document.addEventListener("keydown", this.onKeyDown, false)
        document.addEventListener('mousemove', this.idleReset)
        document.addEventListener('click', this.idleReset)
        this.animationInterval = setInterval(() => {
            if (this.state.animationTimer > 0) {
                this.state.board.setRandomGrid()
                this.setState({
                    board: this.state.board,
                    animationTimer: this.state.animationTimer - .1
                })
            } else if (this.state.animationTimer >= -.5 && this.state.animationTimer <= 0) {
                this.setState({
                    animationTimer: -1
                })
                this.stopBoardAnimation()
            }
        }, 100)
        this.inactivityInterval = setInterval(() => {
            if (this.state.modalInfo.length > 0 || this.state.settingsClicked || this.state.mini === null || this.state.complete) {
                return
            }
            if (this.inactivityTimer > 0) {
                let newTime = this.inactivityTimer - 1
                console.log("Decreasing idle timer to " + newTime)
                this.inactivityTimer = newTime
                if (newTime <= 0) {
                    this.pauseInactive()
                }
            }
        }, 1000)
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.handleWindowResize)
        document.removeEventListener("keydown", this.onKeyDown, false)
        document.removeEventListener('mousemove', this.idleReset)
        document.removeEventListener('click', this.idleReset)
        clearInterval(this.animationInterval)
        clearInterval(this.inactivityInterval)
    }

    idleReset () {
        this.inactivityTimer = this.state.settings.timerInactivity
    }

    handleWindowResize () {
        this.setState({
            windowSize: window.innerWidth
        })
        this.render()
    }

    getTimerValue (value) {
        console.log("Timer passing back value " + value)
        this.timerVal = value
    }

    toggleDropdownVisibility (isOpen, which) {
        if (isOpen) {
            document.getElementById('crossword-' + which + '-dropdown').style.backgroundColor = "#F5F5F5";
        } else {
            document.getElementById('crossword-' + which + '-dropdown').style.removeProperty('background-color')
        }
    }

    settingsClicked () {
        this.setState({
            settingsClicked: true
        })
    }

    closeModal () {
        this.setState({
            settingsClicked: false,
            modalInfo: []
        })
    }

    closeSettings (settings) {
        this.setState({
            settings: settings
        })
        this.closeModal()
    }

    saveSettings (settings) {
        this.setState({
            settings: settings
        })
    }

    loadSettings() {
        console.log("Callback to mini crossword app was hit with login notice")
        this.setState({
            settings: Settings,
            generateDisabled: false,
            loading: false
        })
    }

    pauseClicked () {
        if (this.state.complete || this.state.mini === null || this.state.generating) return

        this.setState({
            modalInfo: this.modalInfos["pauseManual"]
        })
    }

    pauseInactive () {
        this.setState({
            modalInfo: this.modalInfos["pauseInactive"]
        })
    }

    async checkForCompletion (showNotComplete) {
        let mini = this.state.mini
        mini.board.numSeconds = this.timerVal

        let response
        let requestSuccess = false
        try {
            response = await api.miniIsComplete(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            mini.board = response.data
            this.setState({
                mini: mini
            })
            if (response.data.completed === true) {
                this.crosswordFinished()
            } else {
                if (showNotComplete) {
                    this.crosswordUnfinished()
                }
            }
        }
    }

    crosswordFinished () {
        let doneTuple = this.modalInfos["puzzleCorrect"]
        let s = this.timerVal
        let h = Math.floor(s / 3600)
        if (h > 0) s -= h * 3600
        let m = Math.floor(s / 60)
        if (m > 0) s -= m * 60

        let secondStr = s < 10 ? "0" + s : "" + s
        let minuteStr = "" + m
        if (h > 0) {
            minuteStr = m < 10 ? "0" + m : "" + m
        }
        let hourStr = "" + h
        let timeStr = ""
        if (h > 0) timeStr += hourStr + ":"
        timeStr += minuteStr + ":" + secondStr

        let doneMsg = doneTuple[0].replace('{}',timeStr)
        let newDoneTuple = [doneMsg, doneTuple[1], doneTuple[2]]
        this.setState({
            modalInfo: newDoneTuple,
            complete: true
        })
        MiniStatsService.refreshMiniStats(User.token)
    }

    crosswordUnfinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleIncorrect"],
            complete: false
        })
    }

    getWhichNumFromKey (key) {
        if (key === "Backspace") return 8
        else if (key === "Enter") return 13
        else if (key === "Tab") return 9
        else return key.charCodeAt(0)
    }

    onKeyDown (event) {
        this.idleReset()
        // if special key pressed, allow default action
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return
        }
        event.preventDefault()
        if (this.state.complete) {
            return
        }

        const which = event.which === 0 ? this.getWhichNumFromKey(event.key) : event.which

        let modalOpen = this.state.settingsClicked || this.state.modalInfo.length > 0
        if (modalOpen) {
            if (this.state.modalInfo.length > 0 && this.state.modalInfo[0] !== "resetClicked") {
                if (which === 13 || which === 27) {
                    // allow enter/esc keys to close modal (except resetting puzzle requires click)
                    this.closeModal()
                }
            } else if (this.state.settingsClicked && which === 27) {
                // allow esc key to close settings
                this.closeModal()
            }
            return
        }
        let mini = this.state.mini
        if (mini === null) return
        let grid = mini.board.grid
        let selection = mini.board.selection
        let selectedStatus = this.getSelectedSquare().status
        if (which === 13 || which === 9) {
            // enter or tab
            CrosswordKeyActions.tabOrEnter(grid, selection, event.shiftKey, mini.acrossClues, mini.downClues)
        } else if (which === 8) {
            // delete
            CrosswordKeyActions.delete(grid, selection)
        } else if (which === 32) {
            // space bar
            selection.direction = selection.direction === "Across" ? "Down" : "Across"
        } else if (which === 37) {
            // left arrow
            CrosswordKeyActions.leftArrow(grid, selection)
        } else if (which === 38) {
            // up arrow
            CrosswordKeyActions.upArrow(grid, selection)
        } else if (which === 39) {
            // right arrow
            CrosswordKeyActions.rightArrow(grid, selection)
        } else if (which === 40) {
            // down arrow
            CrosswordKeyActions.downArrow(grid, selection)
        } else {
            let gridWasFull = CrosswordKeyActions.gridIsFull(grid)
            console.log("Grid is full? " + gridWasFull)
            if (which >= 65 && which <= 90) {
                // a to z
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key.toUpperCase())
            } else if (which >= 48 && which <= 57) {
                // 0 to 9 or the symbols on the same keys
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key)
            } else if (which >= 186 && which <= 222) {
                // various symbols that we want to allow in case of special themed puzzle
                // disallow the underscore because it is reserved for black squares
                if (event.key === "_") {
                    return
                }
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key)
            }
            if (CrosswordKeyActions.gridIsFull(grid) && this.state.complete !== true) {
                this.checkForCompletion(!gridWasFull)
            }
        }
        mini.board.grid = grid
        mini.board.selection = selection
        this.setState({
            mini: mini
        })
    }

    clueClicked (clue) {
        console.log(this.state)
        let coords = CrosswordKeyActions.getFirstEmptySpace(this.state.mini.board.grid, clue)
        if (coords === null) {
            coords = [clue.rowCoord, clue.colCoord]
        }
        let mini = this.state.mini
        mini.board.selection.rowCoord = coords[0]
        mini.board.selection.colCoord = coords[1]
        mini.board.selection.direction = clue.direction
        this.setState({
            mini: mini
        })
    }

    boardSquareClicked (square) {
        if (this.state.animationTimer > 0 || this.state.generating || this.state.mini === null) return
        if (square.value === "_") {
            return
        }
        let mini = this.state.mini
        let selection = mini.board.selection
        if (square.rowCoord === selection.rowCoord && square.colCoord === selection.colCoord) {
            mini.board.selection.direction = selection.direction === "Across" ? "Down" : "Across"
        } else {
            mini.board.selection.rowCoord = square.rowCoord
            mini.board.selection.colCoord = square.colCoord
        }
        this.setState({
            mini: mini
        })
    }

    getSelectedSquare () {
        let mini = this.state.mini
        return mini.board.grid[mini.board.selection.rowCoord][mini.board.selection.colCoord]
    }

    handleSizeClick (size) {
        if (this.state.size === size) return
        this.setState({
            size: size,
            board: new Board(size)
        })
    }

    handleDifficultyClick (diff) {
        this.setState({
            difficulty: diff
        })
    }

    async generateMini () {
        this.acrossClues = []
        this.downClues = []
        this.timerKey = (new Date()).getTime()
        this.setState({
            mini: null,
            complete: false,
            generating: true,
            generationError: false
        })

        this.scrollRef.current.scrollIntoView()
        this.startBoardAnimation()

        let size = this.state.size
        let diff = this.state.difficulty

        let response
        let requestSuccess
        try {
            response = await api.generateMini(User.token, size, diff)
            requestSuccess = response.status === 200
        } catch(error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            this.setState({
                mini: response.data
            })
            MiniStatsService.addStartedGame(User.token, size, diff)
        } else {
            this.setState({
                generating: false
            })
            console.log("Failed to generate the crossword, try again");
        }
    }

    startBoardAnimation () {
        console.log("starting animation interval")
        this.setState({
            animationTimer: 1,
            modalInfo: []
        })
    }

    stopBoardAnimation () {
        console.log("In stop board animation")
        console.log(this.state.mini)
        if (!this.state.generating) {
            this.setState({
                board: new Board(this.state.size),
                generationError: true
            })
            return
        }
        if (this.state.mini === null) {
            this.setState({
                animationTimer: 1
            })
            return
        }
        this.acrossClues = this.state.mini.acrossClues
        this.downClues = this.state.mini.downClues
        this.setState({
            modalInfo: this.modalInfos["startPuzzle"],
            generating: false
        })
        console.log("added mini: ")
        console.log(this.state.mini)
    }

    async checkSquareClicked () {
        let mini = this.state.mini

        let response
        let requestSuccess = false
        try {
            response = await api.checkMiniSquare(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking mini square")
        } else {
            mini.board = response.data
            this.setState({
                mini: mini
            })
        }
    }

    async checkWordClicked () {
        let mini = this.state.mini

        let response
        let requestSuccess = false
        try {
            response = await api.checkMiniWord(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking mini word")
        } else {
            mini.board = response.data
            this.setState({
                mini: mini
            })
        }
    }

    async checkPuzzleClicked () {
        let mini = this.state.mini

        let response
        let requestSuccess = false
        try {
            response = await api.checkMiniPuzzle(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking mini puzzle")
        } else {
            mini.board = response.data
            this.setState({
                mini: mini
            })
        }
    }

    checkClicked (type) {
        if (this.state.complete || this.state.mini === null) return
        
        if (type === "Square") {
            this.checkSquareClicked()
        } else if (type === "Word") {
            this.checkWordClicked()
        } else {
            this.checkPuzzleClicked()
        }
    }

    async revealSquareClicked () {
        let mini = this.state.mini

        let gridWasFull = CrosswordKeyActions.gridIsFull(mini.board.grid)

        let response
        let requestSuccess = false
        try {
            response = await api.revealMiniSquare(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing mini square")
        } else {
            mini.board = response.data
            this.setState({
                mini: mini
            })
            if (CrosswordKeyActions.gridIsFull(this.state.mini.board.grid)) {
                this.checkForCompletion(!gridWasFull)
            }
        }
    }

    async revealWordClicked () {
        let mini = this.state.mini

        let gridWasFull = CrosswordKeyActions.gridIsFull(mini.board.grid)

        let response
        let requestSuccess = false
        try {
            response = await api.revealMiniWord(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing mini word")
        } else {
            mini.board = response.data
            this.setState({
                mini: mini
            })
            if (CrosswordKeyActions.gridIsFull(this.state.mini.board.grid)) {
                this.checkForCompletion(!gridWasFull)
            }
        }
    }

    async revealPuzzleClicked () {
        let mini = this.state.mini

        let gridWasFull = CrosswordKeyActions.gridIsFull(mini.board.grid)

        let response
        let requestSuccess = false
        try {
            response = await api.revealMiniPuzzle(User.token, mini.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing mini puzzle")
        } else {
            mini.board = response.data
            this.setState({
                mini: mini
            })
            if (CrosswordKeyActions.gridIsFull(this.state.mini.board.grid)) {
                this.checkForCompletion(!gridWasFull)
            }
        }
    }

    revealClicked (type) {
        if (this.state.complete || this.state.mini === null) return

        if (type === "Square") {
            this.revealSquareClicked()
        } else if (type === "Word") {
            this.revealWordClicked()
        } else {
            this.revealPuzzleClicked()
        }
    }

    resetPuzzleClicked () {
        if (this.state.complete || this.state.mini === null) {
            return
        }
        this.setState({
            modalInfo: this.modalInfos["resetClicked"]
        })
    }

    resetPuzzle () {
        let mini = this.state.mini
        for (let r = 0; r < mini.board.grid.length; r++) {
            for (let c = 0; c < mini.board.grid.length; c++) {
                let square = mini.board.grid[r][c]
                if (square.value !== "_") {
                    square.value = ""
                    square.status = "Unchecked"
                }
            }
        }
        this.closeModal()
    }

    render() {
        const { size, difficulty, mini, board, complete, settings, modalInfo, generating, generateDisabled, generationError, settingsClicked, windowSize, loading } = this.state

        const modalOpen = settingsClicked || modalInfo.length > 0
        const colorScheme = settings.colorScheme
        const boardSize = size
        let baseBoardPx = windowSize < 1200 ? 500 : windowSize < 1600 ? 525 : windowSize < 1800 ? 630 : 630 * 1.2
        const mobile = windowSize < 700
        console.log(windowSize)
        if (mobile) {
            baseBoardPx = Math.min(windowSize - 60, window.innerHeight - 60)
        }
        const boardPx = baseBoardPx % boardSize === 0 ? baseBoardPx : baseBoardPx - (baseBoardPx % boardSize)
        const wrapperHeightPx = `${boardPx + 420}px`

        const selectedStyle = {borderColor: "black", backgroundColor: "#F0F0F0"}
        const generatingStyle = {backgroundColor: "gray", pointerEvents: "none"}

        let modalButtonAction
        if (modalInfo[1] === "Reset") {
            modalButtonAction = this.resetPuzzle
        } else if (modalInfo[1] === "Let's do it") {
            modalButtonAction = this.generateMini
        } else {
            modalButtonAction = this.closeModal
        }

        return (
            <Fragment>
                <CrosswordNavBar blurred={modalOpen} loggedIn={this.loadSettings}/>
                <div className="crossword-overlay" style={{display: `${modalOpen ? "" : "none"}`}}></div>
                <SettingsModal
                    shouldShow={settingsClicked}
                    settingsSave={this.saveSettings}
                    settingsBack={this.closeSettings} />
                <MessageModal 
                    message={modalInfo.length > 0 ? modalInfo[0] : ""} 
                    buttonText1={modalInfo.length > 0 ? modalInfo[1] : ""} 
                    buttonAction1={modalButtonAction}
                    buttonText2={modalInfo.length > 2 ? modalInfo[2] : ""}
                    buttonAction2={this.closeModal} />
                <div className="crossword-mini-app-wrapper" ref={this.topRef} style={{filter: modalOpen || loading ? "blur(5px)" : "none"}}>
                    <div className="crossword-mini-app-intro-header">
                        Customize, generate, solve, repeat.
                    </div>
                    <div className="crossword-mini-app-intro-body">
                        Experiment with different sizes and difficulty levels of minis. Keep track of your stats and try to beat your best time, or compete with friends on the leaderboard. If you have trouble with one, just generate another and try again!
                    </div>
                    <div className="crossword-mini-app-divider"></div>
                    <div className="crossword-mini-app-customizations">
                        <div className="crossword-mini-app-customizations-title">Settings</div>
                        <div className="crossword-mini-app-size">
                            <div className="crossword-mini-app-option" style={size === 5 ? selectedStyle : {}} onClick={() => this.handleSizeClick(5)}>5 x 5</div>
                            <div className="crossword-mini-app-option" style={size === 6 ? selectedStyle : {}} onClick={() => this.handleSizeClick(6)}>6 x 6</div>
                            <div className="crossword-mini-app-option" style={size === 7 ? selectedStyle : {}} onClick={() => this.handleSizeClick(7)}>7 x 7</div>
                            <div className="crossword-mini-app-option" style={size === 8 ? selectedStyle : {}} onClick={() => this.handleSizeClick(8)}>8 x 8</div>
                            <div className="crossword-mini-app-option" style={size === 9 ? selectedStyle : {}} onClick={() => this.handleSizeClick(9)}>9 x 9</div>
                        </div>
                        <div className="crossword-mini-app-difficulty">
                            <div className="crossword-mini-app-option" style={difficulty === "Standard" ? selectedStyle : {}} onClick={() => this.handleDifficultyClick("Standard")}>Standard</div>
                            <div className="crossword-mini-app-option" style={difficulty === "Difficult" ? selectedStyle : {}} onClick={() => this.handleDifficultyClick("Difficult")}>Difficult</div>
                            <div className="crossword-mini-app-option" style={difficulty === "Expert" ? selectedStyle : {}} onClick={() => this.handleDifficultyClick("Expert")}>Expert</div>
                        </div>
                        <div className="crossword-mini-app-generate">
                            <div className="crossword-mini-app-generate-button" style={generating || generateDisabled ? generatingStyle : {}}
                                onClick={() => this.generateMini()}>Generate</div>
                        </div>
                    </div>
                    <div className="crossword-mini-generation-error" style={{display: generationError === true ? "block" : "none"}}>
                        <FontAwesomeIcon className="login-error-x" icon={faTimes} onClick={() => this.setState({generationError: false})}/>
                        Failed to generate a puzzle of the desired specifications. This might happen occasionally, just hit generate again.
                    </div>
                    <div ref={this.scrollRef}>
                        <div className="crossword-page-controls">
                            <div className="crossword-settings" onClick={() => { this.settingsClicked() }}>
                                <FontAwesomeIcon style={{color: colorScheme.colors[3]}} className="btn crossword-settings-button" icon={faCog} />
                            </div>
                            <div className="crossword-timer-pause-wrapper">
                                <div className="crossword-timer-pause">
                                    <Timer isPaused={modalInfo.length > 0 || complete || generating || mini === null ? true : false} 
                                    getValue={this.getTimerValue} key={this.timerKey}/>
                                    <div className="btn crossword-pause-button" onClick={() => this.pauseClicked()}>
                                        <FontAwesomeIcon style={{color: colorScheme.colors[3]}} icon={faPause} />
                                    </div>
                                </div>
                            </div>
                            { windowSize < 550 ? 
                                <div className="crossword-dropdown-section-mobile" >
                                    <DropdownButton alignRight id="crossword-mobile-dropdown"
                                        title={<FontAwesomeIcon style={{color: colorScheme.colors[3]}} icon={faLightbulb} />}>
                                        <div className="crossword-mobile-dropdown-item-section">
                                            <Dropdown.Item className="crossword-mobile-dropdown-item" onClick={() => { this.checkClicked("Square") }}>Check Square</Dropdown.Item>
                                            <Dropdown.Item className="crossword-mobile-dropdown-item" onClick={() => { this.checkClicked("Word") }}>Check Word</Dropdown.Item>
                                            <Dropdown.Item className="crossword-mobile-dropdown-item" onClick={() => { this.checkClicked("Puzzle") }}>Check Puzzle</Dropdown.Item>
                                            <Dropdown.Item className="crossword-mobile-dropdown-item" onClick={() => { this.revealClicked("Square") }}>Reveal Square</Dropdown.Item>
                                            <Dropdown.Item className="crossword-mobile-dropdown-item" onClick={() => { this.revealClicked("Word") }}>Reveal Word</Dropdown.Item>
                                            <Dropdown.Item className="crossword-mobile-dropdown-item" onClick={() => { this.revealClicked("Puzzle") }}>Reveal Puzzle</Dropdown.Item>
                                            <Dropdown.Item className="crossword-mobile-dropdown-item mobile-reset-item" onClick={() => this.resetPuzzleClicked()}
                                                style={{backgroundColor: colorScheme.colors[3]}}>
                                                Reset Puzzle
                                            </Dropdown.Item>
                                        </div>
                                    </DropdownButton>
                                </div>
                            :
                                <div className="crossword-dropdowns">
                                    <div className="crossword-reset-button" style={{backgroundColor: colorScheme.colors[3]}}
                                        onClick={() => this.resetPuzzleClicked()}>
                                        Reset
                                    </div>
                                    <DropdownButton id="crossword-check-dropdown" 
                                        title={<span style={{color: "#121212"}}>Check</span>}
                                        onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, 'check') }}>
                                        <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.checkClicked("Square") }}>Square</Dropdown.Item>
                                        <Dropdown.Item className="crossword-dropdown-middle" as="button" onClick={() => { this.checkClicked("Word") }}>Word</Dropdown.Item>
                                        <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.checkClicked("Puzzle") }}>Puzzle</Dropdown.Item>
                                    </DropdownButton>
                                    <DropdownButton id="crossword-reveal-dropdown" 
                                        title={<span style={{color: "#121212"}}>Reveal</span>}
                                        onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, 'reveal') }}>
                                        <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.revealClicked("Square") }}>Square</Dropdown.Item>
                                        <Dropdown.Item className="crossword-dropdown-middle" as="button" onClick={() => { this.revealClicked("Word") }}>Word</Dropdown.Item>
                                        <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.revealClicked("Puzzle") }}>Puzzle</Dropdown.Item>
                                    </DropdownButton>
                                </div>
                            }
                        </div>
                        <CrosswordBoardApp
                            grid={mini === null || generating ? board.grid : mini.board.grid}
                            selection={mini === null || generating ? null : mini.board.selection}
                            generating={mini === null || generating}
                            acrossClues={this.acrossClues}
                            downClues={this.downClues}
                            clueRefMap={{}}
                            boardSquareClicked={this.boardSquareClicked}
                            clueClicked={this.clueClicked}
                            boardWidthPx={boardPx}
                            mobile={mobile} />
                    </div>
                </div>
                { window.innerWidth < 700 ? null : <Footer /> }
            </Fragment>
        )
    }
}

MiniCrosswordApp.propTypes = {}

export default MiniCrosswordApp