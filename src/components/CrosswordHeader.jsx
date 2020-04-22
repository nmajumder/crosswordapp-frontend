import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/CrosswordHeader.css'
import DateUtils from '../libs/DateUtils.js'

class CrosswordHeader extends Component {
    constructor (props) {
        super(props)

        this.getDisplayDate = this.getDisplayDate.bind(this)
    }

    getDisplayDate(dateStr) {
        let displayDate = DateUtils.getDisplayDate(dateStr)
        return displayDate
    }

    render () {
        return (
            <Fragment>
                <div className="crossword-header" onClick={() => { this.props.crosswordSelected(this.props.id) }}>
                    <h3 className="crossword-header-size">{this.props.height} x {this.props.width}</h3>
                    <div className="crossword-header-difficulty">{this.props.difficulty}</div>
                    <h2 className="crossword-header-title">{this.props.title}</h2>
                    <h4 className="crossword-header-date">{this.getDisplayDate(this.props.date)}</h4>
                </div>
            </Fragment>
        )
    }
}

CrosswordHeader.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    crosswordSelected: PropTypes.func.isRequired
}

export default CrosswordHeader