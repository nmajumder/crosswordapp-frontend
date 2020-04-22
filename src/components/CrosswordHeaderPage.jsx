import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordHeader from './CrosswordHeader.jsx'
import '../css/CrosswordHeaderPage.css'

class CrosswordHeaderPage extends Component {
    constructor (props) {
        super(props)
    }

    render () {
        return (
            <Fragment>
                <div className="crossword-header-back-button" onClick={() => { this.props.backSelected() }}>
                    {'<'} Back to home page
                </div>
                <div className="crossword-header-page-wrapper">
                    {this.props.crosswords.map( (c,i) =>
                        <CrosswordHeader 
                            key={i}
                            id={c.id}
                            title={c.title}
                            date={c.date}
                            difficulty={c.difficulty}
                            height={c.board.grid.length}
                            width={c.board.grid[0].length}
                            crosswordSelected={this.props.crosswordSelected}
                        />
                    )}
                </div>
            </Fragment>
        )
    }
}

CrosswordHeaderPage.propTypes = {
    crosswords: PropTypes.array.isRequired,
    crosswordSelected: PropTypes.func.isRequired,
    backSelected: PropTypes.func.isRequired
}

export default CrosswordHeaderPage