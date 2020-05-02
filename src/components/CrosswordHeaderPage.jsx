import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordHeader from './CrosswordHeader.jsx'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import '../css/CrosswordHeaderPage.css'

class CrosswordHeaderPage extends Component {
    constructor (props) {
        super(props)
    }

    render () {
        return (
            <Fragment>
                <CrosswordNavBar />
                <div className="crossword-header-page-wrapper">
                    <div className="crossword-header-page-intro">
                        <div className="crossword-header-page-intro-header">Dive into some full-sized themed crosswords.</div>
                        <div className="crossword-header-page-intro-body">Customize your settings and start solving. Don't worry if you get stuck, you can always check or reveal some answers to help you along your way.
                                Hit pause if you need a break, your game will be saved when you come back (on this device or another).</div>
                    </div>
                    <div className="crossword-header-page-list">
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
                </div>
            </Fragment>
        )
    }
}

CrosswordHeaderPage.propTypes = {
    crosswords: PropTypes.array.isRequired,
    crosswordSelected: PropTypes.func.isRequired
}

export default CrosswordHeaderPage