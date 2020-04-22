import React, { Fragment, Component } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PropTypes from 'prop-types'
import CrosswordBoardApp from './CrosswordBoardApp.jsx'
import SettingsModal from './SettingsModal.jsx'
import HelpModal from './HelpModal.jsx'
import MessageModal from './MessageModal.jsx'
import Timer from './Timer.jsx'
import CrosswordKeyActions from '../libs/CrosswordKeyActions.js'
import '../css/CrosswordPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faQuestionCircle, faPause } from '@fortawesome/free-solid-svg-icons'
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
            "puzzleCorrect":["Congratulations, you've successfully solved the puzzle!", "Close"],
            "puzzleIncorrect":["Oops, there are still one or more errors to fix", "Close"]
        }

        this.state = {
            crossword: this.props.crossword,
            savedBoard: new BoardStatus(this.props.crossword.board),
            settings: new Settings(),
            modalInfo: [],
            settingsClicked: false,
            helpClicked: false,
            windowSize: window.innerWidth
        }

        this.settingsClicked = this.settingsClicked.bind(this)
        this.saveSettings = this.saveSettings.bind(this)
        this.helpClicked = this.helpClicked.bind(this)
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

        this.clearWordClicked = this.clearWordClicked.bind(this)
        this.clearPuzzleClicked = this.clearPuzzleClicked.bind(this)

        this.toggleDropdownVisibility = this.toggleDropdownVisibility.bind(this)
        this.handleWindowResize = this.handleWindowResize.bind(this)
        this.getTimerValue = this.getTimerValue.bind(this)
        this.saveGridState = this.saveGridState.bind(this)

        this.clueClicked = this.clueClicked.bind(this)
        this.boardSquareClicked = this.boardSquareClicked.bind(this)

        this.onKeyDown = this.onKeyDown.bind(this)

    }

    componentDidMount () {
        window.addEventListener('resize', this.handleWindowResize)
        window.addEventListener('beforeunload', this.saveGridState)
        document.addEventListener("keydown", this.onKeyDown, false);
        this.setState({
            modalInfo: this.modalInfos["startPuzzle"]
        })
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.handleWindowResize)
        window.removeEventListener('beforeunload', this.handleWindowResize)
        document.removeEventListener("keydown", this.onKeyDown, false);
    }

    handleWindowResize () {
        this.setState({
            windowSize: window.innerWidth
        })
        this.render()
    }

    getTimerValue (value) {
        this.state.crossword.board.numSeconds = value
        if (value % 30 < 0) {
            if (this.state.savedBoard.shouldBeUpdated(this.state.crossword.board)) {
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
            console.log('Saving crossword state...')
            console.log(this.state.crossword.board)
            response = await api.updateCrossword(this.state.crossword.id, "ME", this.state.crossword.board)
            console.log(response)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Unable to save state of crossword")
        } else {
            this.state.savedBoard.updateBoardStatus(this.state.crossword.board)
        }
    }

    crosswordFinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleCorrect"]
        })
        this.render()
    }

    crosswordUnfinished () {
        this.setState({
            modalInfo: this.modalInfos["puzzleIncorrect"]
        })
        this.render()
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
            helpClicked: false,
            modalInfo: []
        })
    }

    saveSettings (settings) {
        this.setState({
            settings: settings
        })
    }

    helpClicked () {
        this.setState({
            helpClicked: true
        })
    }

    pauseClicked () {
        this.setState({
            modalInfo: this.modalInfos["pauseManual"]
        })
    }

    async checkSquareClicked () {
        let response
        let requestSuccess = false
        try {
            console.log('Checking crossword square...')
            response = await api.checkCrosswordSquare(this.state.crossword.id, "ME", this.state.crossword.board)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Unable to check crossword square")
        } else {
            this.setState({
                crossword: response.data
            })
        }
        console.log(this.state.crossword.board)
        this.render()
    }

    async checkWordClicked () {
        console.log("Checking a word")
    }

    async checkPuzzleClicked () {
        console.log("Checking the puzzle")
    }

    async revealSquareClicked () {
        console.log("Revealing a square")
    }

    async revealWordClicked () {
        console.log("Revealing a word")
    }

    async revealPuzzleClicked () {
        console.log("Revealing the puzzle")
    }

    async clearWordClicked () {
        console.log("Revealing a word")
    }

    async clearPuzzleClicked () {
        console.log("Clearing the puzzle")
    }

    onKeyDown (event) {
        console.log(event)
        // if special key pressed, allow default action
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return
        }
        event.preventDefault()
        if (this.props.typingDisabled) {
            return
        }
        let crossword = this.props.crossword
        //let selection = this.props.currentSelection
        if (event.which === 13 || event.which === 9) {
            // enter or tab
            CrosswordKeyActions.tabOrEnter(crossword.board, event.shiftKey, this.acrossClues, this.downClues)
        } else if (event.which === 8) {
            // delete
            CrosswordKeyActions.delete(crossword.board)
        } else if (event.which === 37) {
            // left arrow
            CrosswordKeyActions.leftArrow(crossword.board)
        } else if (event.which === 38) {
            // up arrow
            CrosswordKeyActions.upArrow(crossword.board)
        } else if (event.which === 39) {
            // right arrow
            CrosswordKeyActions.rightArrow(crossword.board)
        } else if (event.which === 40) {
            // down arrow
            CrosswordKeyActions.downArrow(crossword.board)
        } else {
            let gridWasFull = CrosswordKeyActions.gridIsFull(crossword.board)
            if (event.which >= 65 && event.which <= 90) {
                // a to z
                console.log(crossword.board)
                CrosswordKeyActions.alphaNumeric(crossword.board, event.key.toUpperCase())
                console.log(crossword.board)
            } else if (event.which >= 48 && event.which <= 57) {
                // 0 to 9 or the symbols on the same keys
                CrosswordKeyActions.alphaNumeric(crossword.board, event.key)
            } else if (event.which >= 186 && event.which <= 222) {
                // various symbols that we want to allow in case of special themed puzzle
                // disallow the underscore because it is reserved for black squares
                if (event.key === "_") {
                    return
                }
                CrosswordKeyActions.alphaNumeric(crossword.board, event.key)
            }
            if (CrosswordKeyActions.gridIsFull(crossword.board.grid)) {
                this.crosswordIsComplete(!gridWasFull)
            }
        }
        this.setState({
            crossword: crossword
        })
        //this.saveSelection(selection)
    }

    clueClicked (clue) {
        let coords = CrosswordKeyActions.getFirstEmptySpace(this.state.crossword.board.grid, clue)
        if (coords === null) {
            coords = [clue.rowCoord, clue.colCoord]
        }
        let crossword = this.state.crossword
        crossword.board.selection.rowCoord = coords[0]
        crossword.board.selection.colCoord = coords[1]
        crossword.board.selection.direction = clue.direction
        this.setState({
            crossword: crossword
        })
        //this.saveSelection(selection)
    }

    boardSquareClicked (square) {
        if (square.value === "_") {
            return
        }
        let crossword = this.state.crossword
        let selection = this.state.crossword.board.selection
        if (square.rowCoord === selection.rowCoord && square.colCoord === selection.colCoord) {
            crossword.board.selection.direction = selection.direction === "Across" ? "Down" : "Across"
        } else {
            crossword.board.selection.rowCoord = square.rowCoord
            crossword.board.selection.colCoord = square.colCoord
        }
        this.setState({
            crossword: crossword
        })
        //this.saveSelection(selection)
    }

    render () {
        const { crossword, settings, modalInfo, settingsClicked, helpClicked, windowSize } = this.state
        const modalOpen = settingsClicked || helpClicked || modalInfo.length > 0
        const colorScheme = settings.colorScheme
        const boardSize = crossword.board.grid.length
        const baseBoardPx = windowSize < 1600 ? 630 : 630 * 1.5
        const boardPx = baseBoardPx % boardSize === 0 ? baseBoardPx : baseBoardPx - (baseBoardPx % boardSize)
        return (
            <Fragment>
                <div className="crossword-overlay" style={{display: `${modalOpen ? "" : "none"}`}}></div>
                <SettingsModal
                    shouldShow={settingsClicked}
                    settings={settings}
                    settingsSave={this.saveSettings}
                    settingsBack={this.closeModal} />
                <HelpModal
                    shouldShow={helpClicked}
                    helpBack={this.closeModal} />
                <MessageModal 
                    message={modalInfo.length > 0 ? modalInfo[0] : ""} 
                    buttonText1={modalInfo.length > 0 ? modalInfo[1] : ""} 
                    buttonAction1={this.closeModal}
                    buttonText2={modalInfo.length > 2 ? modalInfo[2] : ""}
                    buttonAction2={this.closeModal} />
                <div style={{filter: `${modalOpen ? "blur(5px)" : "none"}`}} className="crossword-page-wrapper">
                    <div className="btn crossword-page-back-button" style={{color: colorScheme.colors[3]}} onClick={() => { this.props.backSelected() }}>
                        {'<'} Save progress and go back
                    </div>
                    <div className="crossword-page-heading" style={{ width : boardPx }}>
                        <div className="crossword-page-title">{crossword.title}</div>
                        <div className="crossword-page-author">By Nathan Majumder</div>
                    </div>
                    <div className="crossword-page-controls">
                        <div className="crossword-settings" onClick={() => { this.settingsClicked() }}>
                            <FontAwesomeIcon style={{color: colorScheme.colors[3]}} className="btn crossword-settings-button" icon={faCog} />
                        </div>
                        <div className="crossword-help" onClick={() => { this.helpClicked() }}>
                            <FontAwesomeIcon style={{color: colorScheme.colors[3]}} className="btn crossword-help-button" icon={faQuestionCircle} />
                        </div>
                        <div className="crossword-timer-pause-wrapper">
                            <div className="crossword-timer-pause">
                                <Timer isPaused={modalInfo.length > 0 ? true : false} 
                                startingValue={crossword.board.numSeconds} 
                                getValue={this.getTimerValue}/>
                                <div className="btn crossword-pause-button" onClick={() => this.pauseClicked()}>
                                    <FontAwesomeIcon style={{color: colorScheme.colors[3]}} icon={faPause} />
                                </div>
                            </div>
                        </div>
                        <div className="crossword-dropdowns">
                            <DropdownButton id="crossword-check-dropdown" 
                                title={<span style={{color: "#121212", fontWeight: 600}}>Check</span>}
                                onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, 'check') }}>
                                <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.checkSquareClicked() }}>Square</Dropdown.Item>
                                <Dropdown.Item className="crossword-dropdown-middle" as="button" onClick={() => { this.checkWordClicked() }}>Word</Dropdown.Item>
                                <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.checkPuzzleClicked() }}>Puzzle</Dropdown.Item>
                            </DropdownButton>
                            <DropdownButton id="crossword-reveal-dropdown" 
                                title={<span style={{color: "#121212", fontWeight: 600}}>Reveal</span>}
                                onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, 'reveal') }}>
                                <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.revealSquareClicked() }}>Square</Dropdown.Item>
                                <Dropdown.Item className="crossword-dropdown-middle" as="button" onClick={() => { this.revealWordClicked() }}>Word</Dropdown.Item>
                                <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.revealPuzzleClicked() }}>Puzzle</Dropdown.Item>
                            </DropdownButton>
                            <DropdownButton id="crossword-clear-dropdown" 
                                title={<span style={{color: "#121212", fontWeight: 600}}>Clear</span>}
                                onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, 'clear') }}>
                                <Dropdown.Item className="crossword-dropdown-top" as="button" onClick={() => { this.clearWordClicked() }}>Word</Dropdown.Item>
                                <Dropdown.Item className="crossword-dropdown-bottom" as="button" onClick={() => { this.clearPuzzleClicked() }}>Puzzle</Dropdown.Item>
                            </DropdownButton>
                        </div>
                    </div>
                    <CrosswordBoardApp
                        crossword={crossword} 
                        boardSquareClicked={this.boardSquareClicked}
                        clueClicked={this.clueClicked}
                        typingDisabled={modalOpen}
                        boardWidthPx={boardPx}
                        windowWidthPx={windowSize}
                        settings={settings}
                        crosswordFinished={this.crosswordFinished}
                        crosswordUnfinished={this.crosswordUnfinished} />
                </div>
            </Fragment>
        )
    }
}

CrosswordPage.propTypes = {
    crossword: PropTypes.object.isRequired,
    backSelected: PropTypes.func.isRequired
}

export default CrosswordPage