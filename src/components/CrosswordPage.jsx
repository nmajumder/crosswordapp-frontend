import React, { Fragment, Component } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PropTypes from 'prop-types'
import CrosswordBoardApp from './CrosswordBoardApp.jsx'
import SettingsModal from './SettingsModal.jsx'
import MessageModal from './MessageModal.jsx'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import Timer from './Timer.jsx'
import CrosswordKeyActions from '../libs/CrosswordKeyActions.js'
import '../css/CrosswordPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faPause, faEdit } from '@fortawesome/free-solid-svg-icons'
import { faLightbulb } from '@fortawesome/free-regular-svg-icons'
import Settings from '../libs/Settings.js'
import BoardStatus from '../libs/BoardStatus.js'
import User from '../libs/User.js'
import api from '../libs/api.js'
import RatingsService from '../libs/RatingsService.js'
import Footer from './Footer.jsx'

class CrosswordPage extends Component {
    constructor (props) {
        super(props)
        this.modalInfos = {
            "startPuzzle":["Ready to get started?", "Let's Go"],
            "pauseManual":["Your game has been paused", "Resume"],
            "pauseInactive":["Your game has been paused due to inactivity", "Resume"],
            "resetClicked":["Are you sure you want to reset the puzzle? This will clear the board but not the timer.", "Reset", "Cancel"],
            "puzzleCorrect":["Congratulations, you've successfully solved the puzzle in {}!", "Rate", "Not Now"],
            "puzzleIncorrect":["Oops, there are still one or more errors to fix", "Close"],
            "ratePuzzle":["Rate this puzzle on difficulty and enjoyment level:", "Save", "Cancel"]
        }

        this.inactivityTimer = Settings.timerInactivity

        this.crosswordId = this.props.crossword.id
        this.board = this.props.crossword.board

        this.state = {
            grid: this.props.crossword.board.grid,
            selection: this.props.crossword.board.selection,
            savedBoard: new BoardStatus(this.props.crossword.board),
            settings: Settings,
            modalInfo: [],
            settingsClicked: false,
            windowSize: window.innerWidth
        }

        this.settingsClicked = this.settingsClicked.bind(this)
        this.saveSettings = this.saveSettings.bind(this)
        this.closeSettings = this.closeSettings.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.ratePuzzleClicked = this.ratePuzzleClicked.bind(this)
        this.ratePuzzle = this.ratePuzzle.bind(this)
        this.pauseClicked = this.pauseClicked.bind(this)
        this.crosswordFinished = this.crosswordFinished.bind(this)
        this.crosswordUnfinished = this.crosswordUnfinished.bind(this)

        this.checkSquareClicked = this.checkSquareClicked.bind(this)
        this.checkWordClicked = this.checkWordClicked.bind(this)
        this.checkPuzzleClicked = this.checkPuzzleClicked.bind(this)

        this.revealSquareClicked = this.revealSquareClicked.bind(this)
        this.revealWordClicked = this.revealWordClicked.bind(this)
        this.revealPuzzleClicked = this.revealPuzzleClicked.bind(this)

        this.resetPuzzleClicked = this.resetPuzzleClicked.bind(this)
        this.resetPuzzle = this.resetPuzzle.bind(this)

        this.idleReset = this.idleReset.bind(this)
        this.toggleDropdownVisibility = this.toggleDropdownVisibility.bind(this)
        this.handleWindowResize = this.handleWindowResize.bind(this)
        this.getTimerValue = this.getTimerValue.bind(this)
        this.saveGridState = this.saveGridState.bind(this)
        this.checkForCompletion = this.checkForCompletion.bind(this)

        this.clueClicked = this.clueClicked.bind(this)
        this.boardSquareClicked = this.boardSquareClicked.bind(this)

        this.getSelectedSquare = this.getSelectedSquare.bind(this)
        this.crosswordIsComplete = this.crosswordIsComplete.bind(this)

        this.onKeyDown = this.onKeyDown.bind(this)
        this.getWhichNumFromKey = this.getWhichNumFromKey.bind(this)
    }

    componentDidMount () {
        window.addEventListener('resize', this.handleWindowResize)
        window.addEventListener('beforeunload', this.saveGridState)
        document.addEventListener("keydown", this.onKeyDown, false)
        document.addEventListener('mousemove', this.idleReset)
        document.addEventListener('click', this.idleReset)
        this.inactivityInterval = setInterval(() => {
            if (this.state.modalInfo.length > 0 || this.state.settingsClicked || this.crosswordIsComplete()) {
                return
            }
            if (this.inactivityTimer > 0) {
                let newTime = this.inactivityTimer - 1
                this.inactivityTimer = newTime
                if (newTime <= 0) {
                    this.setState({
                        modalInfo: this.modalInfos["pauseInactive"]
                    })
                }
            }
        }, 1000)

        if (this.props.crossword.board.completed !== true) {
            this.setState({
                modalInfo: this.modalInfos["startPuzzle"]
            })
        }
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.handleWindowResize)
        window.removeEventListener('beforeunload', this.saveGridState)
        document.removeEventListener("keydown", this.onKeyDown, false)
        document.removeEventListener('mousemove', this.idleReset)
        document.removeEventListener('click', this.idleReset)
        clearInterval(this.inactivityInterval)
        this.saveGridState()
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
        this.board.numSeconds = value
        if (value % 30 < 0) {
            if (this.state.savedBoard.shouldBeUpdated(this.state.grid, this.state.selection)) {
                this.saveGridState()
            }
        }
    }

    async saveGridState () {
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let response
        let requestSuccess = false
        try {
            response = await api.updateCrossword(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Unable to save state of crossword")
        } else {
            this.state.savedBoard.updateBoardStatus(this.state.grid, this.state.selection)
        }
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

    ratePuzzleClicked () {
        this.setState({
            modalInfo: this.modalInfos["ratePuzzle"]
        })
    }

    async ratePuzzle (difRating, enjRating) {
        this.board.difficultyRating = difRating
        this.board.enjoymentRating = enjRating

        let response
        let requestSuccess
        try {
            response = await api.rateCrossword(this.crosswordId, User.token, this.board)
            requestSuccess = true
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error saving crossword rating")
        } else {
            RatingsService.refreshRatings()
            this.board = response.data
        }
        this.closeModal()
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

    pauseClicked () {
        if (this.crosswordIsComplete()) return

        this.setState({
            modalInfo: this.modalInfos["pauseManual"]
        })
    }

    async checkSquareClicked () {
        if (this.crosswordIsComplete()) return

        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let response
        let requestSuccess = false
        try {
            response = await api.checkCrosswordSquare(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking crossword square")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
        }
    }

    async checkWordClicked () {
        if (this.crosswordIsComplete()) return

        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let response
        let requestSuccess = false
        try {
            response = await api.checkCrosswordWord(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking crossword word")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
        }
    }

    async checkPuzzleClicked () {
        if (this.crosswordIsComplete()) return
        
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let response
        let requestSuccess = false
        try {
            response = await api.checkCrosswordPuzzle(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking crossword puzzle")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
        }
    }

    async revealSquareClicked () {
        if (this.crosswordIsComplete()) return
        
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let gridWasFull = CrosswordKeyActions.gridIsFull(this.board.grid)

        let response
        let requestSuccess = false
        try {
            response = await api.revealCrosswordSquare(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing crossword square")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
            if (CrosswordKeyActions.gridIsFull(this.state.grid)) {
                this.checkForCompletion(!gridWasFull)
            }
        }
    }

    async revealWordClicked () {
        if (this.crosswordIsComplete()) return
        
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let gridWasFull = CrosswordKeyActions.gridIsFull(this.board.grid)

        let response
        let requestSuccess = false
        try {
            response = await api.revealCrosswordWord(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing crossword word")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
            if (CrosswordKeyActions.gridIsFull(this.state.grid)) {
                this.checkForCompletion(!gridWasFull)
            }
        }
    }

    async revealPuzzleClicked () {
        if (this.crosswordIsComplete()) return
        
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let gridWasFull = CrosswordKeyActions.gridIsFull(this.board.grid)

        let response
        let requestSuccess = false
        try {
            response = await api.revealCrosswordPuzzle(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing crossword puzzle")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
            if (CrosswordKeyActions.gridIsFull(this.state.grid)) {
                this.checkForCompletion(!gridWasFull)
            }
        }
    }

    resetPuzzleClicked () {
        if (this.crosswordIsComplete()) {
            this.closeModal()
            return
        }
        this.setState({
            modalInfo: this.modalInfos["resetClicked"]
        })
    }

    async resetPuzzle () {
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let response
        let requestSuccess = false
        try {
            response = await api.clearCrosswordPuzzle(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        this.closeModal()
        if (!requestSuccess) {
            console.log("Received an error clearing crossword puzzle")
        } else {
            this.setState({
                grid: response.data.grid,
                selection: response.data.selection
            })
        }
    }

    async checkForCompletion (showNotComplete) {
        this.board.grid = this.state.grid
        this.board.selection = this.state.selection

        let response
        let requestSuccess = false
        try {
            response = await api.crosswordIsComplete(this.crosswordId, User.token, this.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            this.setState({
                grid: response.data.grid
            })
            console.log(response.data)
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
        this.board.completed = true
        let doneTuple = this.modalInfos["puzzleCorrect"]
        let s = this.board.numSeconds
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
            modalInfo: newDoneTuple
        })
    }

    crosswordUnfinished () {
        this.board.completed = false
        this.setState({
            modalInfo: this.modalInfos["puzzleIncorrect"]
        })
    }

    getWhichNumFromKey (key) {
        if (key === "Backspace") return 8
        else if (key === "Enter") return 13
        else if (key === "Tab") return 9
        else if (key === "Space") return 32
        else return key.charCodeAt(0)
    }

    onKeyDown (event) {
        this.idleReset()
        // if special key pressed, allow default action
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return
        }
        event.preventDefault()
        
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
        let grid = this.state.grid
        let selection = this.state.selection
        if (which === 13 || which === 9) {
            // enter or tab
            CrosswordKeyActions.tabOrEnter(grid, selection, event.shiftKey, 
                this.props.crossword.acrossClues, this.props.crossword.downClues, this.board.completed)
        } else if (which === 8) {
            // delete
            CrosswordKeyActions.delete(grid, selection, this.board.completed)
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
            if (which >= 65 && which <= 90) {
                // a to z
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key.toUpperCase(), this.board.completed)
            } else if (which >= 48 && which <= 57) {
                // 0 to 9 or the symbols on the same keys
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key, this.board.completed)
            } else if (which >= 186 && which <= 222) {
                // various symbols that we want to allow in case of special themed puzzle
                // disallow the underscore because it is reserved for black squares
                if (event.key === "_") {
                    return
                }
                CrosswordKeyActions.alphaNumeric(grid, selection, event.key, this.board.completed)
            }
            if (CrosswordKeyActions.gridIsFull(grid) && this.board.completed !== true) {
                this.checkForCompletion(!gridWasFull)
            }
        }
        this.setState({
            grid: grid,
            selection: selection
        })
    }

    clueClicked (clue) {
        let coords = CrosswordKeyActions.getFirstEmptySpace(this.state.grid, clue)
        if (coords === null) {
            coords = [clue.rowCoord, clue.colCoord]
        }
        let selection = this.state.selection
        selection.rowCoord = coords[0]
        selection.colCoord = coords[1]
        selection.direction = clue.direction
        this.setState({
            selection: selection
        })
    }

    boardSquareClicked (square) {
        if (square.value === "_") {
            return
        }
        let selection = this.state.selection
        if (square.rowCoord === selection.rowCoord && square.colCoord === selection.colCoord) {
            selection.direction = selection.direction === "Across" ? "Down" : "Across"
        } else {
            selection.rowCoord = square.rowCoord
            selection.colCoord = square.colCoord
        }
        this.setState({
            selection: selection
        })
    }

    crosswordIsComplete () {
        return this.board.completed
    }

    getSelectedSquare () {
        let grid = this.state.grid
        let selection = this.state.selection
        return grid[selection.rowCoord][selection.colCoord]
    }

    render () {
        const { grid, selection, settings, modalInfo, settingsClicked, windowSize } = this.state
        const modalOpen = settingsClicked || modalInfo.length > 0
        const colorScheme = settings.colorScheme
        const boardSize = grid.length
        let baseBoardPx = windowSize < 1200 ? 500 : windowSize < 1600 ? 525 : windowSize < 1800 ? 630 : 630 * 1.2
        const mobile = windowSize <= 705 || window.mobileCheck()
        if (mobile) {
            baseBoardPx = Math.min(windowSize, 600)
        }
        const boardPx = baseBoardPx % boardSize === 0 ? baseBoardPx : baseBoardPx - (baseBoardPx % boardSize)
        return (
            <Fragment>
                <CrosswordNavBar blurred={modalOpen}/>
                <div className="crossword-overlay" style={{display: `${modalOpen ? "" : "none"}`}}></div>
                <SettingsModal
                    shouldShow={settingsClicked}
                    settingsSave={this.saveSettings}
                    settingsBack={this.closeSettings} />
                <MessageModal 
                    message={modalInfo.length > 0 ? modalInfo[0] : ""} 
                    buttonText1={modalInfo.length > 0 ? modalInfo[1] : ""} 
                    buttonAction1={modalInfo[1] === "Reset" ? this.resetPuzzle : 
                        modalInfo[1] === "Rate" ? this.ratePuzzleClicked : 
                        modalInfo[1] === "Save" ? this.ratePuzzle : this.closeModal}
                    buttonText2={modalInfo.length > 2 ? modalInfo[2] : ""}
                    buttonAction2={this.closeModal} 
                    board={this.board} />
                <div className="crossword-page-wrapper" style={{filter: `${modalOpen ? "blur(5px)" : "none"}`, margin: mobile ? `20px ${(windowSize - boardPx) / 2}px` : ""}} >
                    <div className="crossword-page-heading">
                        <div className="crossword-page-title-heading" style={{ width : mobile ? "" : boardPx }}>
                            <div className="crossword-page-title">{this.props.crossword.title}</div>
                            <div className="crossword-page-author">By Nathan Majumder</div>
                        </div>
                        { window.innerWidth < 400 || mobile ? null :
                            <div className="crossword-page-rating-heading" style={{width: mobile ? "" : `calc(100% - ${boardPx}px)`}}>
                                { this.board.difficultyRating > 0 || this.board.enjoymentRating > 0 ?
                                    <div className="crossword-page-my-ratings">
                                        <div className="crossword-page-my-ratings-header bold">My Ratings</div>
                                        <FontAwesomeIcon id="ratings-edit-icon" icon={faEdit} onClick={() => this.ratePuzzleClicked()} />
                                        <div className="crossword-page-my-ratings-line">
                                            <span className="crossword-page-my-ratings-line-header">Difficulty:</span>
                                            <span className="bold">
                                                {this.board.difficultyRating > 0 ? this.board.difficultyRating + " / 10" : "Not Rated"}
                                            </span></div>
                                        <div className="crossword-page-my-ratings-line">
                                            <span className="crossword-page-my-ratings-line-header">Enjoyment:</span>
                                            <span className="bold">
                                                {this.board.enjoymentRating > 0 ? this.board.enjoymentRating + " / 10" : "Not Rated"}
                                            </span></div>
                                    </div>
                                    :
                                    <button disabled={this.crosswordIsComplete() ? false : true} 
                                        title={this.crosswordIsComplete() ? "" : "Finish the puzzle first"} 
                                        className="crossword-page-rating-button" onClick={() => this.ratePuzzleClicked()}>
                                        { mobile ? "Rate" : "Rate this puzzle!" }
                                    </button>
                                }
                            </div>
                        }
                    </div>
                    <div className="crossword-page-controls">
                        <div className="crossword-settings" style={{display: mobile ? "none" : ""}} onClick={() => { this.settingsClicked() }}>
                            <FontAwesomeIcon style={{color: colorScheme.colors[3]}} className="btn crossword-settings-button" icon={faCog} />
                        </div>
                        <div className="crossword-timer-pause-wrapper">
                            <div className="crossword-timer-pause">
                                <Timer isPaused={modalInfo.length > 0 || this.crosswordIsComplete() ? true : false} 
                                startingValue={this.board.numSeconds} 
                                getValue={this.getTimerValue}/>
                                <div className="btn crossword-pause-button" onClick={() => this.pauseClicked()}>
                                    <FontAwesomeIcon style={{color: colorScheme.colors[3]}} icon={faPause} />
                                </div>
                            </div>
                        </div>
                        { mobile ? 
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
                                    <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.checkSquareClicked() }}>Square</Dropdown.Item>
                                    <Dropdown.Item className="crossword-dropdown-middle" as="button" onClick={() => { this.checkWordClicked() }}>Word</Dropdown.Item>
                                    <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.checkPuzzleClicked() }}>Puzzle</Dropdown.Item>
                                </DropdownButton>
                                <DropdownButton id="crossword-reveal-dropdown" 
                                    title={<span style={{color: "#121212"}}>Reveal</span>}
                                    onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, 'reveal') }}>
                                    <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.revealSquareClicked() }}>Square</Dropdown.Item>
                                    <Dropdown.Item className="crossword-dropdown-middle" as="button" onClick={() => { this.revealWordClicked() }}>Word</Dropdown.Item>
                                    <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.revealPuzzleClicked() }}>Puzzle</Dropdown.Item>
                                </DropdownButton>
                            </div>
                        }
                    </div>
                    <CrosswordBoardApp
                        grid={grid}
                        selection={selection}
                        acrossClues={this.props.crossword.acrossClues}
                        downClues={this.props.crossword.downClues}
                        clueRefMap={this.props.crossword.clueRefMap}
                        boardSquareClicked={this.boardSquareClicked}
                        clueClicked={this.clueClicked}
                        boardWidthPx={boardPx}
                        mobile={mobile} />
                </div>
                { window.innerWidth < 700 ? null : <Footer blur={modalOpen} /> }
            </Fragment>
        )
    }
}

CrosswordPage.propTypes = {
    crossword: PropTypes.object.isRequired
}

export default CrosswordPage