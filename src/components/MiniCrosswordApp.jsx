import React, { StrictMode, Component } from 'react'
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
import api from '../libs/api.js'
import User from '../libs/User.js'
import MiniStatsService from '../libs/MiniStatsService.js'

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
            "puzzleCorrect":["Congrats, you've solved the puzzle! Want to play another?", "Let's do it", "Not yet"],
            "puzzleIncorrect":["Oops, there are still one or more errors to fix", "Close"]
        }

        this.acrossClues = []
        this.downClues = []
        this.timerKey = (new Date()).getTime()
        this.timerVal = 0
        this.checked = false
        this.revealed = false

        this.state = {
            size: 5,
            difficulty: "Easy",
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
            windowSize: window.innerWidth
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
        this.recordStats = this.recordStats.bind(this)

        this.checkSquare = this.checkSquare.bind(this)
        this.checkSquareClicked = this.checkSquareClicked.bind(this)
        this.checkWordClicked = this.checkWordClicked.bind(this)
        this.checkPuzzleClicked = this.checkPuzzleClicked.bind(this)

        this.revealSquare = this.revealSquare.bind(this)
        this.revealSquareClicked = this.revealSquareClicked.bind(this)
        this.revealWordClicked = this.revealWordClicked.bind(this)
        this.revealPuzzleClicked = this.revealPuzzleClicked.bind(this)

        this.resetPuzzleClicked = this.resetPuzzleClicked.bind(this)
        this.resetPuzzle = this.resetPuzzle.bind(this)

        this.onKeyDown = this.onKeyDown.bind(this)
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
            generateDisabled: false
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

    checkForCompletion (board, showNotComplete) {
        console.log(`Checking for completion and ${showNotComplete ? "" : "not "}showing if not complete`)
        for (let r = 0; r < board.grid.length; r++) {
            for (let c = 0; c < board.grid.length; c++) {
                if (board.solution[r][c] !== board.grid[r][c].value) {
                    if (showNotComplete) {
                        this.crosswordUnfinished()
                    }
                    return
                }
            }
        }
        this.crosswordFinished()
    }

    crosswordFinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleCorrect"],
            complete: true
        })
        this.recordStats()
    }

    async recordStats () {
        let response
        let requestSuccess
        try {
            response = await api.miniCompleted(User.token, this.state.mini.board.grid.length, this.state.mini.difficulty, this.timerVal, this.checked, this.revealed)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            MiniStatsService.updateMiniStats(response.data)
        } else {
            console.log("Unable to save mini stats for completed game")
        }
    }

    crosswordUnfinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleIncorrect"],
            complete: false
        })
    }

    onKeyDown (event) {
        this.idleReset()
        // if special key pressed, allow default action
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return
        }
        event.preventDefault()
        let modalOpen = this.state.settingsClicked || this.state.modalInfo.length > 0
        if (modalOpen || this.state.complete) {
            return
        }
        let mini = this.state.mini
        let grid = mini.board.grid
        let selection = mini.board.selection
        let selectedStatus = this.getSelectedSquare().status
        if (event.which === 13 || event.which === 9) {
            // enter or tab
            CrosswordKeyActions.tabOrEnter(grid, selection, event.shiftKey, mini.acrossClues, mini.downClues)
        } else if (event.which === 8) {
            // delete
            CrosswordKeyActions.delete(grid, selection)
        } else if (event.which === 32) {
            // space bar
            selection.direction = selection.direction === "Across" ? "Down" : "Across"
        } else if (event.which === 37) {
            // left arrow
            CrosswordKeyActions.leftArrow(grid, selection)
        } else if (event.which === 38) {
            // up arrow
            CrosswordKeyActions.upArrow(grid, selection)
        } else if (event.which === 39) {
            // right arrow
            CrosswordKeyActions.rightArrow(grid, selection)
        } else if (event.which === 40) {
            // down arrow
            CrosswordKeyActions.downArrow(grid, selection)
        } else {
            let gridWasFull = CrosswordKeyActions.gridIsFull(grid)
            console.log("Grid is full? " + gridWasFull)
            if (event.which >= 65 && event.which <= 90) {
                // a to z
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key.toUpperCase())
            } else if (event.which >= 48 && event.which <= 57) {
                // 0 to 9 or the symbols on the same keys
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key)
            } else if (event.which >= 186 && event.which <= 222) {
                // various symbols that we want to allow in case of special themed puzzle
                // disallow the underscore because it is reserved for black squares
                if (event.key === "_") {
                    return
                }
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key)
            }
            if (CrosswordKeyActions.gridIsFull(grid) && this.state.complete !== true) {
                this.checkForCompletion(mini.board, !gridWasFull)
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
        this.checked = false
        this.revealed = false
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

    checkSquare (square, solution) {
        if (square.value === "" || square.value === "_" || square.status === "Revealed") {
            return;
        } else if (square.value === solution[square.rowCoord][square.colCoord]) {
            square.status = "CheckedTrue"
        } else {
            square.status = "CheckedFalse"
        }
    }

    checkSquareClicked () {
        let mini = this.state.mini
        let selection = mini.board.selection
        let square = mini.board.grid[selection.rowCoord][selection.colCoord]
        this.checkSquare(square, mini.board.solution)
        this.setState({
            mini: mini
        })
    }

    checkWordClicked () {
        let mini = this.state.mini
        let r = mini.board.selection.rowCoord
        let c = mini.board.selection.colCoord
        let dir = mini.board.selection.direction
        if (dir === "Across") {
            let ind = mini.board.grid[r][c].acrossWordIndex
            let x = c - ind
            while (x < mini.board.grid.length && mini.board.grid[r][x].value !== "_") {
                this.checkSquare(mini.board.grid[r][x], mini.board.solution)
                x++
            }
        } else {
            let ind = mini.board.grid[r][c].downWordIndex
            let y = r - ind
            while (y < mini.board.grid.length && mini.board.grid[y][c].value !== "_") {
                this.checkSquare(mini.board.grid[y][c], mini.board.solution)
                y++
            }
        }
        this.setState({
            mini: mini
        })
    }

    checkPuzzleClicked () {
        let mini = this.state.mini
        for (let r = 0; r < mini.board.grid.length; r++) {
            for (let c = 0; c < mini.board.grid.length; c++) {
                this.checkSquare(mini.board.grid[r][c], mini.board.solution)
            }
        }
        this.setState({
            mini: mini
        })
    }

    checkClicked (type) {
        if (this.state.complete || this.state.mini === null) return

        this.checked = true
        
        if (type === "Square") {
            this.checkSquareClicked()
        } else if (type === "Word") {
            this.checkWordClicked()
        } else {
            this.checkPuzzleClicked()
        }
    }

    revealSquare (square, solution) {
        if (square.value === "_" || square.status === "CheckedTrue") {
            return
        }
        square.value = solution[square.rowCoord][square.colCoord]
        square.status = "Revealed"
    }

    revealSquareClicked () {
        let mini = this.state.mini
        let selection = mini.board.selection
        let square = mini.board.grid[selection.rowCoord][selection.colCoord]
        this.revealSquare(square, mini.board.solution)
        this.setState({
            mini: mini
        })
    }

    revealWordClicked () {
        let mini = this.state.mini
        let r = mini.board.selection.rowCoord
        let c = mini.board.selection.colCoord
        let dir = mini.board.selection.direction
        if (dir === "Across") {
            let ind = mini.board.grid[r][c].acrossWordIndex
            let x = c - ind
            while (x < mini.board.grid.length && mini.board.grid[r][x].value !== "_") {
                this.revealSquare(mini.board.grid[r][x], mini.board.solution)
                x++
            }
        } else {
            let ind = mini.board.grid[r][c].downWordIndex
            let y = r - ind
            while (y < mini.board.grid.length && mini.board.grid[y][c].value !== "_") {
                this.revealSquare(mini.board.grid[y][c], mini.board.solution)
                y++
            }
        }
        this.setState({
            mini: mini
        })
    }

    revealPuzzleClicked () {
        let mini = this.state.mini
        for (let r = 0; r < mini.board.grid.length; r++) {
            for (let c = 0; c < mini.board.grid.length; c++) {
                this.revealSquare(mini.board.grid[r][c], mini.board.solution)
            }
        }
        this.setState({
            mini: mini
        })
        this.crosswordFinished()
    }

    revealClicked (type) {
        if (this.state.complete || this.state.mini === null) return
        
        let gridWasFull = CrosswordKeyActions.gridIsFull(this.state.mini.board.grid)
        this.revealed = true

        if (type === "Square") {
            this.revealSquareClicked()
        } else if (type === "Word") {
            this.revealWordClicked()
        } else {
            this.revealPuzzleClicked()
        }

        if (CrosswordKeyActions.gridIsFull(this.state.mini.board.grid)) {
            this.checkForCompletion(this.state.mini.board, !gridWasFull)
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
        const { size, difficulty, mini, board, complete, settings, modalInfo, generating, generateDisabled, generationError, settingsClicked, windowSize } = this.state

        const modalOpen = settingsClicked || modalInfo.length > 0
        const colorScheme = settings.colorScheme
        const boardSize = size
        const baseBoardPx = windowSize < 1100 ? 500 : windowSize < 1600 ? 630 : 630 * 1.2
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
            <StrictMode>
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
                <div className="crossword-mini-app-wrapper" ref={this.topRef} style={{filter: modalOpen ? "blur(5px)" : "none", height: wrapperHeightPx}}>
                    <div className="crossword-mini-app-intro-header">
                        Customize, generate, solve, repeat.
                    </div>
                    <div className="crossword-mini-app-intro-body">
                        Experiment with different sizes and difficulty levels of minis. Keep track of your stats and try to beat your best time. If you have trouble with one, just generate another and try again!
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
                            <div className="crossword-mini-app-option" style={difficulty === "Easy" ? selectedStyle : {}} onClick={() => this.handleDifficultyClick("Easy")}>Easy</div>
                            <div className="crossword-mini-app-option" style={difficulty === "Moderate" ? selectedStyle : {}} onClick={() => this.handleDifficultyClick("Moderate")}>Moderate</div>
                            <div className="crossword-mini-app-option" style={difficulty === "Hard" ? selectedStyle : {}} onClick={() => this.handleDifficultyClick("Hard")}>Difficult</div>
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
                            windowWidthPx={windowSize} />
                    </div>
                </div>
            </StrictMode>
        )
    }
}

MiniCrosswordApp.propTypes = {}

export default MiniCrosswordApp