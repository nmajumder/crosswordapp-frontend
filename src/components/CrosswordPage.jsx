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
import { faCog, faPause, faBoxTissue } from '@fortawesome/free-solid-svg-icons'
import Settings from '../libs/Settings.js'
import BoardStatus from '../libs/BoardStatus.js'
import api from '../libs/api.js'

class CrosswordPage extends Component {
    constructor (props) {
        super(props)
        this.modalInfos = {
            "startPuzzle":["Ready to get started?", "Let's Go"],
            "pauseManual":["Your game has been paused", "Resume"],
            "pauseInactive":["Your game has been paused due to inactivity", "Resume"],
            "resetClicked":["Are you sure you want to reset the puzzle? This will clear the board but not the timer.", "Reset", "Cancel"],
            "puzzleCorrect":["Congratulations, you've successfully solved the puzzle!", "Close"],
            "puzzleIncorrect":["Oops, there are still one or more errors to fix", "Close"]
        }

        this.inactivityTimer = Settings.timerInactivity

        this.crosswordId = this.props.crossword.id

        this.state = {
            board: this.props.crossword.board,
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

    }

    componentDidMount () {
        window.addEventListener('resize', this.handleWindowResize)
        window.addEventListener('beforeunload', this.saveGridState)
        document.addEventListener("keydown", this.onKeyDown, false)
        document.addEventListener('mousemove', this.idleReset)
        document.addEventListener('click', this.idleReset)
        this.setState({
            modalInfo: this.modalInfos["startPuzzle"]
        })
        this.inactivityInterval = setInterval(() => {
            if (this.state.modalInfo.length > 0 || this.state.settingsClicked || this.crosswordIsComplete()) {
                return
            }
            if (this.inactivityTimer > 0) {
                let newTime = this.inactivityTimer - 1
                console.log("Decreasing idle timer to " + newTime)
                this.inactivityTimer = newTime
                if (newTime <= 0) {
                    this.setState({
                        modalInfo: this.modalInfos["pauseInactive"]
                    })
                }
            }
        }, 1000)
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.handleWindowResize)
        window.removeEventListener('beforeunload', this.saveGridState)
        document.removeEventListener("keydown", this.onKeyDown, false)
        document.removeEventListener('mousemove', this.idleReset)
        document.removeEventListener('click', this.idleReset)
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
        this.state.board.numSeconds = value
        if (value % 30 < 0) {
            if (this.state.savedBoard.shouldBeUpdated(this.state.board)) {
                this.saveGridState()
            } else {
                console.log("No need to save board, nothing has changed")
            }
        }
    }

    async saveGridState () {
        let response
        let requestSuccess = false
        try {
            response = await api.updateCrossword(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Unable to save state of crossword")
        } else {
            this.state.savedBoard.updateBoardStatus(this.state.board)
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

        let response
        let requestSuccess = false
        try {
            response = await api.checkCrosswordSquare(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking crossword square")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    async checkWordClicked () {
        if (this.crosswordIsComplete()) return

        let response
        let requestSuccess = false
        try {
            response = await api.checkCrosswordWord(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking crossword word")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    async checkPuzzleClicked () {
        if (this.crosswordIsComplete()) return

        let response
        let requestSuccess = false
        try {
            response = await api.checkCrosswordPuzzle(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error checking crossword puzzle")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    async revealSquareClicked () {
        if (this.crosswordIsComplete()) return

        let response
        let requestSuccess = false
        try {
            response = await api.revealCrosswordSquare(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing crossword square")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    async revealWordClicked () {
        if (this.crosswordIsComplete()) return

        let response
        let requestSuccess = false
        try {
            response = await api.revealCrosswordWord(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing crossword word")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    async revealPuzzleClicked () {
        if (this.crosswordIsComplete()) return

        let response
        let requestSuccess = false
        try {
            response = await api.revealCrosswordPuzzle(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Received an error revealing crossword puzzle")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    resetPuzzleClicked () {
        this.setState({
            modalInfo: this.modalInfos["resetClicked"]
        })
    }

    async resetPuzzle () {
        if (this.crosswordIsComplete()) {
            this.closeModal()
            return
        }

        let response
        let requestSuccess = false
        try {
            response = await api.clearCrosswordPuzzle(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        this.closeModal()
        if (!requestSuccess) {
            console.log("Received an error clearing crossword puzzle")
        } else {
            this.setState({
                board: response.data
            })
        }
    }

    async checkForCompletion (showNotComplete) {
        let response
        let requestSuccess = false
        try {
            response = await api.crosswordIsComplete(this.crosswordId, "ME", this.state.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            this.setState({
                board: response.data
            })
            if (this.getSelectedSquare().status === "Complete") {
                this.crosswordFinished()
            } else {
                if (showNotComplete) {
                    this.crosswordUnfinished()
                }
            }
        }
    }

    crosswordFinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleCorrect"]
        })
    }

    crosswordUnfinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleIncorrect"]
        })
    }

    onKeyDown (event) {
        console.log(event)
        // if special key pressed, allow default action
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return
        }
        event.preventDefault()
        let modalOpen = this.state.settingsClicked || this.state.helpClicked || this.state.modalInfo.length > 0
        if (modalOpen) {
            return
        }
        let board = this.state.board
        let selectedStatus = this.getSelectedSquare().status
        if (event.which === 13 || event.which === 9) {
            // enter or tab
            CrosswordKeyActions.tabOrEnter(board, event.shiftKey, this.props.crossword.acrossClues, this.props.crossword.downClues)
        } else if (event.which === 8) {
            // delete
            CrosswordKeyActions.delete(board)
        } else if (event.which === 37) {
            // left arrow
            CrosswordKeyActions.leftArrow(board)
        } else if (event.which === 38) {
            // up arrow
            CrosswordKeyActions.upArrow(board)
        } else if (event.which === 39) {
            // right arrow
            CrosswordKeyActions.rightArrow(board)
        } else if (event.which === 40) {
            // down arrow
            CrosswordKeyActions.downArrow(board)
        } else {
            let gridWasFull = CrosswordKeyActions.gridIsFull(board.grid)
            console.log("Grid is full? " + gridWasFull)
            if (event.which >= 65 && event.which <= 90) {
                // a to z
                CrosswordKeyActions.alphaNumeric(board, event.key.toUpperCase())
            } else if (event.which >= 48 && event.which <= 57) {
                // 0 to 9 or the symbols on the same keys
                CrosswordKeyActions.alphaNumeric(board, event.key)
            } else if (event.which >= 186 && event.which <= 222) {
                // various symbols that we want to allow in case of special themed puzzle
                // disallow the underscore because it is reserved for black squares
                if (event.key === "_") {
                    return
                }
                CrosswordKeyActions.alphaNumeric(board, event.key)
            }
            if (CrosswordKeyActions.gridIsFull(board.grid) && this.getSelectedSquare().status !== "Complete") {
                this.checkForCompletion(!gridWasFull)
            }
        }
        this.setState({
            board: board
        })
    }

    clueClicked (clue) {
        let coords = CrosswordKeyActions.getFirstEmptySpace(this.state.board.grid, clue)
        if (coords === null) {
            coords = [clue.rowCoord, clue.colCoord]
        }
        let board = this.state.board
        board.selection.rowCoord = coords[0]
        board.selection.colCoord = coords[1]
        board.selection.direction = clue.direction
        this.setState({
            board: board
        })
    }

    boardSquareClicked (square) {
        if (square.value === "_") {
            return
        }
        let board = this.state.board
        let selection = board.selection
        if (square.rowCoord === selection.rowCoord && square.colCoord === selection.colCoord) {
            board.selection.direction = selection.direction === "Across" ? "Down" : "Across"
        } else {
            board.selection.rowCoord = square.rowCoord
            board.selection.colCoord = square.colCoord
        }
        this.setState({
            board: board
        })
    }

    crosswordIsComplete () {
        return this.getSelectedSquare().status === "Complete"
    }

    getSelectedSquare () {
        let board = this.state.board
        return board.grid[board.selection.rowCoord][board.selection.colCoord]
    }

    render () {
        const { board, settings, modalInfo, settingsClicked, windowSize } = this.state
        const modalOpen = settingsClicked || modalInfo.length > 0
        const colorScheme = settings.colorScheme
        const boardSize = board.grid.length
        const baseBoardPx = windowSize < 1600 ? 630 : 630 * 1.2
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
                    buttonAction1={modalInfo[1] === "Reset" ? this.resetPuzzle : this.closeModal}
                    buttonText2={modalInfo.length > 2 ? modalInfo[2] : ""}
                    buttonAction2={this.closeModal} />
                <div style={{filter: `${modalOpen ? "blur(5px)" : "none"}`}} className="crossword-page-wrapper">
                    <div className="crossword-page-heading" style={{ width : boardPx }}>
                        <div className="crossword-page-title">{this.props.crossword.title}</div>
                        <div className="crossword-page-author">By Nathan Majumder</div>
                    </div>
                    <div className="crossword-page-controls">
                        <div className="crossword-settings" onClick={() => { this.settingsClicked() }}>
                            <FontAwesomeIcon style={{color: colorScheme.colors[3]}} className="btn crossword-settings-button" icon={faCog} />
                        </div>
                        <div className="crossword-timer-pause-wrapper">
                            <div className="crossword-timer-pause">
                                <Timer isPaused={modalInfo.length > 0 || this.crosswordIsComplete() ? true : false} 
                                startingValue={board.numSeconds} 
                                getValue={this.getTimerValue}/>
                                <div className="btn crossword-pause-button" onClick={() => this.pauseClicked()}>
                                    <FontAwesomeIcon style={{color: colorScheme.colors[3]}} icon={faPause} />
                                </div>
                            </div>
                        </div>
                        <div className="crossword-dropdowns">
                            <div className="crossword-reset-button" style={{backgroundColor: colorScheme.colors[3]}}
                                onClick={() => this.resetPuzzleClicked()}>
                                <div className="crossword-reset-button-overlay"></div>
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
                    </div>
                    <CrosswordBoardApp
                        board={board}
                        acrossClues={this.props.crossword.acrossClues}
                        downClues={this.props.crossword.downClues}
                        clueRefMap={this.props.crossword.clueRefMap}
                        boardSquareClicked={this.boardSquareClicked}
                        clueClicked={this.clueClicked}
                        boardWidthPx={boardPx}
                        windowWidthPx={windowSize} />
                </div>
            </Fragment>
        )
    }
}

CrosswordPage.propTypes = {
    crossword: PropTypes.object.isRequired
}

export default CrosswordPage