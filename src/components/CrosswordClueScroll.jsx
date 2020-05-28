import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../css/CrosswordBoardApp.css'
import Settings from '../libs/Settings.js'

class CrosswordClueScroll extends Component {
    constructor (props) {
        super(props)

        this.scrollRef = React.createRef()
        this.clueRefs = []
        for (let clue of this.props.clueList) {
            this.clueRefs.push(React.createRef())
        }
        this.getClueBackgroundColor = this.getClueBackgroundColor.bind(this)
        this.getClueBorderColor = this.getClueBorderColor.bind(this)
        this.getClueTextColor = this.getClueTextColor.bind(this)
    }

    componentDidUpdate() {
        let selectedInd = this.props.clueList.findIndex(c => c.number === this.props.selectedClue.number)
        for (let clue of this.props.clueList) {
            this.clueRefs.push(React.createRef())
        }
        try {
            if (this.scrollRef !== undefined) {
                this.scrollRef.current.scrollTop = this.clueRefs[selectedInd].current.offsetTop - this.clueRefs[0].current.offsetTop
            }
        } catch(error) {
            // this will fail first time before we have rendered the clues
        }
    }

    getClueBackgroundColor (clue) {
        if (clue.number === this.props.selectedClue.number && this.props.isMatchingDirection) {
            return Settings.colorScheme.colors[2]
        }
        return "white"
    }

    getClueBorderColor (clue) {
        if (clue.number === this.props.selectedClue.number) {
            return Settings.colorScheme.colors[2]
        }   
        return "white"
    }

    getClueTextColor (clue, grid) {
        let r = clue.rowCoord
        let c = clue.colCoord
        let len = clue.answerLength
        for (let i = 0; i < len; i++) {
            if (clue.direction === "Across") {
                if (grid[r][c+i].value === "") {
                    return "black"
                }
            } else {
                if (grid[r+i][c].value === "") {
                    return "black"
                }
            }
        }
        return "#808080"
    } 

    render () {
        return (
            <div className="crossword-clue-list">
                <div className="crossword-clue-list-title">
                    {this.props.listTitle}
                </div>
                <div className="crossword-clue-scroll" ref={this.scrollRef}>
                    {this.props.clueList.map( (clue,i) =>
                        <div key={i} ref={this.clueRefs[i]} className="crossword-clue-row" onClick={() => { this.props.clueClicked(clue) }}
                            style={{backgroundColor : this.getClueBackgroundColor(clue), 
                                    borderLeftColor : this.getClueBorderColor(clue),
                                    color: this.getClueTextColor(clue, this.props.grid)}}>
                            <div className="crossword-clue-row-number">{clue.number}</div>
                            <div className="crossword-clue-row-text">{clue.text}</div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

CrosswordClueScroll.propTypes = {
    listTitle: PropTypes.string.isRequired,
    clueList: PropTypes.array.isRequired,
    selectedClue: PropTypes.object.isRequired,
    isMatchingDirection: PropTypes.bool.isRequired,
    clueClicked: PropTypes.func.isRequired,
    grid: PropTypes.array.isRequired
}

export default CrosswordClueScroll

