import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/CrosswordBoardApp.css'
import CrosswordClueScroll from './CrosswordClueScroll.jsx'
import Keyboard from './Keyboard.jsx'
import Settings from '../libs/Settings.js'
import CrosswordSquareSlash from './CrosswordSquareSlash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

class CrosswordBoardApp extends Component {
    constructor (props) {
        super(props)

        this.acrossClues = this.props.acrossClues.sort((c1, c2) => (c1.number > c2.number) ? 1 : -1)
        this.downClues = this.props.downClues.sort((c1, c2) => (c1.number > c2.number) ? 1 : -1)
        this.clueRefMap = this.props.clueRefMap

        this.getSelectedSquares = this.getSelectedSquares.bind(this)
        this.getReferencedSquares = this.getReferencedSquares.bind(this)
        this.getSquaresOfClue = this.getSquaresOfClue.bind(this)
        this.getSquareBackgroundColor = this.getSquareBackgroundColor.bind(this)
        this.getSquareValueColor = this.getSquareValueColor.bind(this)
        this.getSquareStyle = this.getSquareStyle.bind(this)
    }

    componentWillReceiveProps (props) {
        this.acrossClues = this.props.acrossClues.sort((c1, c2) => (c1.number > c2.number) ? 1 : -1)
        this.downClues = this.props.downClues.sort((c1, c2) => (c1.number > c2.number) ? 1 : -1)
    }

    getSelectedSquares (selection) {
        if (this.props.generating) return []
        let boardSquare = this.props.grid[selection.rowCoord][selection.colCoord]
        let selectedCoordList = []
        if (selection.direction === "Across") {
            let clue = this.props.acrossClues.find(clue => clue.number === boardSquare.acrossClueNum)
            selectedCoordList = selectedCoordList.concat(this.getSquaresOfClue(clue))
        } else {
            let clue = this.props.downClues.find(clue => clue.number === boardSquare.downClueNum)
            selectedCoordList = selectedCoordList.concat(this.getSquaresOfClue(clue))
        }
        return selectedCoordList
    }

    getReferencedSquares (selection) {
        if (this.props.generating) return []
        let selectedCoordList = []
        if (selection.direction === "Across") {
            let clueNum = this.props.grid[selection.rowCoord][selection.colCoord].acrossClueNum
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
            let clueNum = this.props.grid[selection.rowCoord][selection.colCoord].downClueNum
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
                return Settings.colorScheme.colors[1]
            } else {
                return Settings.colorScheme.colors[2]
            }
        } else if (referencedSquares.includes(thisSquareKey)) {
            return Settings.colorScheme.colors[0]
        }
        return "white"
    }

    getSquareValueColor (square) {
        if (square.status === "Revealed" || square.status === "CheckedTrue") {
            return Settings.colorScheme.colors[4]
        }
        return "black"
    }

    getSquareStyle (squarePx, grid, square, selection, highlightedSquares, referencedSquares) {
        let r = square.rowCoord
        let c = square.colCoord
        let bottomColor = r + 1 < grid.length ? `${grid[r+1][c].value === "_" ? "#777777" : "black"}` : "black"
        let rightColor = c + 1 < grid.length ? `${grid[r][c+1].value === "_" ? "#777777" : "black"}` : "black"
        let style = {
            width: squarePx,
            height: squarePx,
            backgroundColor: this.getSquareBackgroundColor(square, selection, highlightedSquares, referencedSquares),
            borderBottomColor: bottomColor,
            borderRightColor: rightColor
        }
        return style
    }

    render () {
        const selection = this.props.selection
        const grid = this.props.grid

        const boardPx = this.props.boardWidthPx
        const boardSize = grid.length
        const rowPx = boardPx / boardSize
        const squarePx = rowPx - 1

        const highlightedSquares = this.getSelectedSquares(selection)
        const referencedSquares = this.getReferencedSquares(selection)

        const acrossClue = this.props.generating ? null : this.acrossClues.find(c => c.number === grid[selection.rowCoord][selection.colCoord].acrossClueNum)
        const downClue = this.props.generating ? null : this.downClues.find(c => c.number === grid[selection.rowCoord][selection.colCoord].downClueNum)

        // for mobile clue
        let thisClueNum = null
        let thisClueText = null
        if (!this.props.generating && acrossClue !== undefined && downClue !== undefined) {
            if (selection.direction === "Across") {
                thisClueNum = acrossClue.number + "A"
                thisClueText = acrossClue.text
            } else {
                thisClueNum = downClue.number + "D"
                thisClueText = downClue.text
            }
        }
        let clueBoxWid = boardPx - 20

        let squareNumberFontSizeMap = {
            5: ["14px", "16px", "19px", "21px", "22px", "26px"],
            6: ["13px", "15px", "18px", "20px", "21px", "25px"],
            7: ["10px", "12px", "14px", "16px", "20px", "24px"],
            8: ["10px", "12px", "14px", "17px", "19px", "23px"],
            9: ["9px", "11px", "13px", "15px", "18px", "22px"],
            15: ["6px", "8px", "12px", "12px", "14px"],
            21: ["5px", "6px", "7px", "8px", "10px"]
        }

        let squareNumberStyle = {
            fontSize: squareNumberFontSizeMap[boardSize][0],
            marginLeft: boardSize >= 15 ? "1px" : "5px",
            marginTop: boardSize >= 15 ? "0px" : "4px"
        }

        let squareFontSizeMap = {
            5: ["34px", "44px", "50px", "60px", "68px", "76px"],
            6: ["28px", "38px", "44px", "50px", "58px", "66px"],
            7: ["25px", "32px", "40px", "44px", "52px", "60px"],
            8: ["20px", "26px", "32px", "36px", "43px", "50px"],
            9: ["18px", "23px", "28px", "32px", "40px", "45px"],
            15: ["11px", "16px", "20px", "22px", "28px"],
            21: ["8px", "11px", "14px", "17px", "21px"]
        }

        let squareMarginTopMap = {
            5: [squarePx*3/10, squarePx*3/10, squarePx*3/10, squarePx*35/100],
            6: [squarePx*3/10, squarePx*3/10, squarePx*35/100, squarePx*35/100],
            7: [squarePx*3/10, squarePx*3/10, squarePx*3/10, squarePx*3/10],
            8: [squarePx*35/100, squarePx*35/100, squarePx*35/100, squarePx*35/100],
            9: [squarePx*35/100, squarePx*35/100, squarePx*32/100, squarePx*35/100],
            15: [squarePx*3/10, squarePx*35/100, squarePx*4/10, squarePx*35/100],
            21: [squarePx*37/100, squarePx*33/100, squarePx*33/100, squarePx*3/10]
        }

        let squareValueSize
        let squareMarginTop

        if (boardPx < 370) {
            squareNumberStyle["fontSize"] = squareNumberFontSizeMap[boardSize][0]
            squareNumberStyle["marginLeft"] = boardSize > 10 ? "0px" : "2px"
            squareNumberStyle["marginTop"] = boardSize > 10 ? "0px" : "1px"
            squareValueSize = squareFontSizeMap[boardSize][0]
            squareMarginTop = squareMarginTopMap[boardSize][0]
        } else if (boardPx < 480) {
            squareNumberStyle["fontSize"] = squareNumberFontSizeMap[boardSize][1]
            squareValueSize = squareFontSizeMap[boardSize][1]
            squareMarginTop = squareMarginTopMap[boardSize][0]
        } else if (boardPx < 580) {
            squareNumberStyle["fontSize"] = squareNumberFontSizeMap[boardSize][1]
            squareValueSize = squareFontSizeMap[boardSize][2]
            squareMarginTop = squareMarginTopMap[boardSize][1]
        } else if (boardPx < 700) {
            squareNumberStyle["fontSize"] = squareNumberFontSizeMap[boardSize][2]
            squareValueSize = squareFontSizeMap[boardSize][3]
            squareMarginTop = squareMarginTopMap[boardSize][2]
        } else {
            squareNumberStyle["fontSize"] = squareNumberFontSizeMap[boardSize][3]
            squareValueSize = squareFontSizeMap[boardSize][4]
            squareMarginTop = squareMarginTopMap[boardSize][3]
        }

        console.log(this.props.mobile)

        return (
            <Fragment>
                <div className="crossword-board-and-clues-wrapper">
                    <div className="crossword-board" style={{ width : boardPx, height : boardPx }}>
                        {grid.map( (row, i) =>
                            <div key={i} style={{height : rowPx}}>
                                {row.map( (square, j) => 
                                    <div key={j} className={"crossword-square"} onClick={() => { this.props.boardSquareClicked(square) }}
                                            style={this.getSquareStyle(squarePx, grid, square, selection, highlightedSquares, referencedSquares)}>
                                        <div className="board-square-number" style={squareNumberStyle}>
                                            {grid[i][j].number > 0 ? grid[i][j].number : ""}</div>
                                        <div className="board-square-value" 
                                            style={{width: squarePx, height: squarePx/2, marginTop: squareMarginTop,
                                                color: this.getSquareValueColor(square),
                                                fontSize: squareValueSize}}>
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
                    { this.props.generating ? null :
                        this.props.mobile ? 
                        <div>
                            <div className="mobile-crossword-clue-box"
                                style={{width: clueBoxWid, padding: "10px", backgroundColor: Settings.colorScheme.colors[2]}}>
                                <FontAwesomeIcon id="mobile-left-chevron" icon={faChevronLeft}
                                    onClick={() => document.dispatchEvent(
                                        new KeyboardEvent('keydown', {key: 'Enter', shiftKey: true, bubbles: true})
                                    )} />
                                <div className="mobile-crossword-clue">
                                    <span className="mobile-crossword-clue-span">
                                        <span style={{fontWeight: "600", marginRight: "10px"}}>{thisClueNum}</span>{thisClueText}
                                    </span>
                                </div>
                                <FontAwesomeIcon id="mobile-right-chevron" icon={faChevronRight} 
                                    onClick={() => document.dispatchEvent(
                                        new KeyboardEvent('keydown', {key: 'Enter', shiftKey: false, bubbles: true})
                                    )} />
                            </div>
                            <Keyboard id="embedded-keyboard" onKeyPress={(key) => document.dispatchEvent(
                                new KeyboardEvent('keydown',{key: key, bubbles: true})
                            )}/>
                        </div>
                        :
                        <div className="crossword-clue-section" style={{height : boardPx}}>
                            <CrosswordClueScroll 
                                listTitle={"Across"}
                                clueList={this.acrossClues}
                                selectedClue={acrossClue}
                                isMatchingDirection={selection.direction === 'Across'}
                                clueClicked={this.props.clueClicked}
                                grid={grid}/>
                            <CrosswordClueScroll 
                                listTitle={"Down"}
                                clueList={this.downClues}
                                selectedClue={downClue}
                                isMatchingDirection={selection.direction === 'Down'}
                                clueClicked={this.props.clueClicked}
                                grid={grid}/>
                        </div>
                    }
                </div>
            </Fragment>
        )
    }
}

CrosswordBoardApp.propTypes = {
    grid: PropTypes.array.isRequired,
    selection: PropTypes.object,
    generating: PropTypes.bool,
    acrossClues: PropTypes.array.isRequired,
    downClues: PropTypes.array.isRequired,
    clueRefMap: PropTypes.object.isRequired,
    boardSquareClicked: PropTypes.func.isRequired,
    clueClicked: PropTypes.func.isRequired,
    boardWidthPx: PropTypes.number.isRequired,
    mobile: PropTypes.bool
}

export default CrosswordBoardApp