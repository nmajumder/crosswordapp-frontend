import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/MiniCrosswordApp.css'

class MiniCrosswordApp extends Component {

    render() {
        return (
            <Fragment>
                <div className="mini-crossword-back-button" onClick={() => { this.props.backSelected() }}>
                    {'<'} Back to home page
                </div>
                <div>This is the mini crossword app</div>
            </Fragment>
        )
    }
}

MiniCrosswordApp.propTypes = {
    backSelected: PropTypes.func.isRequired
}

export default MiniCrosswordApp