import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/CrosswordBoardApp.css'
import CrosswordClueScroll from './CrosswordClueScroll.jsx'
import api from '../libs/api.js'
import CrosswordSquareSlash from './CrosswordSquareSlash'

class CrosswordBoardApp extends Component {
    constructor (props) {
        super(props)

        this.acrossClues = this.props.crossword.acrossClues.sort((c1, c2) => (c1.number > c2.number) ? 1 : -1)
        this.downClues = this.props.crossword.downClues.sort((c1, c2) => (c1.number > c2.number) ? 1 : -1)
        this.clueRefMap = this.props.crossword.clueRefMap

        this.getSelectedSquares = this.getSelectedSquares.bind(this)
        this.getReferencedSquares = this.getReferencedSquares.bind(this)
        this.getSquaresOfClue = this.getSquaresOfClue.bind(this)
        this.getSquareBackgroundColor = this.getSquareBackgroundColor.bind(this)
        this.getSquareValueColor = this.getSquareValueColor.bind(this)

        this.crosswordIsComplete = this.crosswordIsComplete.bind(this)
    }

    async crosswordIsComplete (showNotComplete) {
        let response
        let requestSuccess = false
        try {
            console.log('Checking whether crossword is finished...')
            console.log(this.props.crossword.board)
            response = await api.crosswordIsComplete(this.props.crossword.id, "ME", this.props.crossword.board)
            console.log(response)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            if (response.data) {
                this.props.crosswordFinished()
            } else {
                if (showNotComplete) {
                    this.props.crosswordUnfinished()
                }
            }
        }
    }

    getSelectedSquares (selection) {
        let boardSquare = this.props.crossword.board.grid[selection.rowCoord][selection.colCoord]
        let selectedCoordList = []
        if (selection.direction === "Across") {
            let clue = this.acrossClues.find(clue => clue.number === boardSquare.acrossClueNum)
            selectedCoordList = selectedCoordList.concat(this.getSquaresOfClue(clue))
        } else {
            let clue = this.downClues.find(clue => clue.number === boardSquare.downClueNum)
            selectedCoordList = selectedCoordList.concat(this.getSquaresOfClue(clue))
        }
        return selectedCoordList
    }

    getReferencedSquares (selection) {
        let selectedCoordList = []
        if (selection.direction === "Across") {
            let clueNum = this.props.crossword.board.grid[selection.rowCoord][selection.colCoord].acrossClueNum
            let clueKey = "A" + clueNum
            if (clueKey in this.clueRefMap) {
                for (let key of this.clueRefMap[clueKey]) {
                    let clue
                    if (key.substring(0,1) === "A") {
                        clue = this.acrossClues.find(clue => clue.number.toString() === key.substring(1,key.length))
                    } else {
                        clue = this.downClues.find(clue => clue.number.toString() === key.substring(1, key.length))
                    }
                    selectedCoordList = selectedCoordList.concat(this.getSquaresOfClue(clue))
                }
            }
        } else {
            let clueNum = this.props.crossword.board.grid[selection.rowCoord][selection.colCoord].downClueNum
            let clueKey = "D" + clueNum
            if (clueKey in this.clueRefMap) {
                for (let key of this.clueRefMap[clueKey]) {
                    let clue
                    if (key.substring(0,1) === "A") {
                        clue = this.acrossClues.find(clue => clue.number.toString() === key.substring(1,key.length))
                    } else {
                        clue = this.downClues.find(clue => clue.number.toString() === key.substring(1, key.length))
                    }
                    selectedCoordList = selectedCoordList.concat(this.getSquaresOfClue(clue))
                }
            }
        }
        return selectedCoordList
    }

    getSquaresOfClue (clue) {
        const [firstRow, firstCol] = [clue.rowCoord, clue.colCoord]
        let coordList = []
        if (clue.direction === "Across") {
            for (let i = firstCol; i < firstCol + clue.answerLength; i++) {
                coordList.push([firstRow, i].toString())
            }
        } else {
            for (let i = firstRow; i < firstRow + clue.answerLength; i++) {
                coordList.push([i, firstCol].toString())
            }
        }
        return coordList
    }

    getSquareBackgroundColor (square, selection, highlightedSquares, referencedSquares) {
        if (square.value === "_") return "black"
        let thisSquareKey = [square.rowCoord, square.colCoord].toString()
        if (highlightedSquares.includes(thisSquareKey)) {
            if (thisSquareKey === [selection.rowCoord, selection.colCoord].toString()) {
                return this.props.settings.colorScheme.colors[1]
            } else {
                return this.props.settings.colorScheme.colors[2]
            }
        } else if (referencedSquares.includes(thisSquareKey)) {
            return this.props.settings.colorScheme.colors[0]
        }
        return "white"
    }

    getSquareValueColor (square) {
        if (square.status === "Revealed" || square.status === "CheckedTrue") {
            return this.props.settings.colorScheme.colors[3]
        }
        return "black"
    }

    render () {
        //const { currentSelection, grid } = this.state
        const selection = this.props.crossword.board.selection
        const grid = this.props.crossword.board.grid

        let clueWidthPx = "" + (this.props.windowWidthPx - (this.props.boardWidthPx + 160) - 2) + "px"

        const boardPx = this.props.boardWidthPx
        const boardSize = this.props.crossword.board.grid.length
        const rowPx = boardPx / boardSize
        const squarePx = rowPx - 1

        const highlightedSquares = this.getSelectedSquares(selection)
        const referencedSquares = this.getReferencedSquares(selection)

        const acrossClue = this.acrossClues.find(c => c.number === grid[selection.rowCoord][selection.colCoord].acrossClueNum)
        const downClue = this.downClues.find(c => c.number === grid[selection.rowCoord][selection.colCoord].downClueNum)

        let squareNumberStyle = {
            fontSize: `${boardSize > 15 ? "6pt" : `${boardSize > 9 ? "9pt" : "16pt"}`}`,
            marginLeft: `${boardSize <= 9 ? "5px" : ""}`,
            marginTop: `${boardSize <= 9 ? "4px" : ""}`
        }
        let squareValueStyle = {
            width: squarePx,
            height: squarePx/2,
            marginTop: squarePx*3/10,
            fontSize: `${boardSize > 15 ? "13pt" : `${boardSize > 10 ? "17pt" : "44pt"}`}`
        }

        if (boardPx > 700) {
            // handle bigger board on large screens
            squareNumberStyle["fontSize"] = `${boardSize > 15 ? "10pt" : `${boardSize > 10 ? "13pt" : "22pt"}`}`
            squareValueStyle["fontSize"] = `${boardSize > 15 ? "20pt" : `${boardSize > 10 ? "24pt" : "64pt"}`}`
        }

        return (
            <Fragment>
                <div className="crossword-board-and-clues-wrapper">
                    <div className="crossword-board" style={{ width : boardPx, height : boardPx }}>
                        {grid.map( (row, i) =>
                            <div key={i} style={{height : rowPx}}>
                                {row.map( (square, j) => 
                                    <div key={j} className={"crossword-square"} onClick={() => { this.props.boardSquareClicked(square) }}
                                            style={{width : squarePx, height : squarePx, 
                                                backgroundColor : this.getSquareBackgroundColor(square, selection, highlightedSquares, referencedSquares)}}>
                                        <div className="board-square-number" style={squareNumberStyle}>
                                            {grid[i][j].number > 0 ? grid[i][j].number : ""}</div>
                                        <div className="board-square-value" 
                                            style={{width: squarePx, height: squarePx/2, marginTop: squarePx*3/10,
                                                color: this.getSquareValueColor(square),
                                                fontSize: `${boardSize > 15 ? `${boardPx > 700 ? "20pt" : "13pt"}` : 
                                                    `${boardSize > 10 ? `${boardPx > 700 ? "24pt" : "17pt"}` : `${boardPx > 700 ? "64pt" : "44pt"}`}`}`}}>
                                            {square.value === "" || square.value === '_' ? '' : square.value}
                                        </div>
                                        <CrosswordSquareSlash 
                                            hidden={square.status !== "CheckedFalse"} 
                                            width={squarePx} height={squarePx} />
                                    </div>
                                )}
                            </div>

                        )}
                    </div>
                    <div className="crossword-clue-section" style={{width : clueWidthPx, height : boardPx}}>
                        <CrosswordClueScroll 
                            listTitle={"Across"}
                            clueList={this.acrossClues}
                            selectedClue={acrossClue}
                            isMatchingDirection={selection.direction === 'Across'}
                            clueClicked={this.props.clueClicked}
                            settings={this.props.settings}/>
                        <CrosswordClueScroll 
                            listTitle={"Down"}
                            clueList={this.downClues}
                            selectedClue={downClue}
                            isMatchingDirection={selection.direction === 'Down'}
                            clueClicked={this.props.clueClicked}
                            settings={this.props.settings}/>
                    </div>
                </div>
            </Fragment>
        )
    }
}

CrosswordBoardApp.propTypes = {
    crossword: PropTypes.object.isRequired,
    boardSquareClicked: PropTypes.func.isRequired,
    clueClicked: PropTypes.func.isRequired,
    typingDisabled: PropTypes.bool.isRequired,
    boardWidthPx: PropTypes.number.isRequired,
    windowWidthPx: PropTypes.number.isRequired,
    settings: PropTypes.object.isRequired,
    crosswordFinished: PropTypes.func.isRequired,
    crosswordUnfinished: PropTypes.func.isRequired
}

export default CrosswordBoardApp