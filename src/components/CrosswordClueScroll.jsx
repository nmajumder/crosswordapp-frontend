import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import '../css/CrosswordBoardApp.css'

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
    }

    componentDidUpdate() {
        let selectedInd = this.props.clueList.findIndex(c => c.number === this.props.selectedClue.number)
        this.scrollRef.current.scrollTop = this.clueRefs[selectedInd].current.offsetTop - this.clueRefs[0].current.offsetTop
    }

    getClueBackgroundColor (clue) {
        if (clue.number === this.props.selectedClue.number && this.props.isMatchingDirection) {
            return this.props.settings.colorScheme.colors[2]
        }
        return "white"
    }

    getClueBorderColor (clue) {
        if (clue.number === this.props.selectedClue.number) {
            return this.props.settings.colorScheme.colors[2]
        }   
        return "white"
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
                            style={{backgroundColor : this.getClueBackgroundColor(clue), borderLeftColor : this.getClueBorderColor(clue)}}>
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
    settings: PropTypes.object.isRequired
}

export default CrosswordClueScroll

