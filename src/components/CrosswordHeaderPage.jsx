import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordHeader from './CrosswordHeader.jsx'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import '../css/CrosswordHeaderPage.css'
import CrosswordService from '../libs/CrosswordService.js'
import RatingsService from '../libs/RatingsService.js'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareDown, faCaretSquareRight, faAngleDown, faLongArrowAltUp, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons'
import Footer from './Footer.jsx'

class CrosswordHeaderPage extends Component {
    constructor (props) {
        super(props)

        this.sortTypes = ["Date", "Grid Size", "My Progress", "User Difficulty", "User Rating"]

        this.state = {
            sortType: 0,
            sortTypeOpen: false,
            desc: true
        }

        this.toggleDropdownVisibility = this.toggleDropdownVisibility.bind(this)
        this.sortTypeClicked = this.sortTypeClicked.bind(this)
        this.sortOrderClicked = this.sortOrderClicked.bind(this)
    }

    toggleDropdownVisibility (isOpen) {
        this.setState({
            sortTypeOpen: isOpen
        })
    }

    sortTypeClicked (ind) {
        this.setState({
            sortType: ind
        })
    }

    sortOrderClicked () {
        this.setState({
            desc: !this.state.desc
        })
    }

    render () {
        const { sortType, sortTypeOpen, desc } = this.state 

        const crosswords = this.props.crosswords
        const ratings = this.props.ratings

        if (crosswords === undefined || ratings === undefined) return null

        let notStarted = crosswords.length
        let inProgress = 0
        let complete = 0
        for (let c of crosswords) {
            let attr = CrosswordService.getCrosswordAttributesById(c.id)
            if (attr["complete"]) {
                complete++
                notStarted--
            } else if (attr["seconds"] > 0 || attr["percent"] > 0) {
                inProgress++
                notStarted--
            }
        }

        let sortFunc
        if (sortType === 0) {
            sortFunc = function(a,b) {
                if (a.date === b.date) return 0
                else if (desc && a.date < b.date || !desc && a.date >= b.date) {
                    return 1
                } else {
                    return -1
                }
            }
        } else if (sortType === 1) {
            sortFunc = function(a,b) {
                let l1 = a.board.grid.length
                let l2 = b.board.grid.length
                if (l1 === l2) return 0
                else if (desc && l1 < l2 || !desc && l1 >= l2) {
                    return 1
                } else {
                    return -1
                }
            }
        } else if (sortType == 2) {
            sortFunc = function(a,b) {
                console.log(a.id)
                console.log(b.id)
                let a1 = CrosswordService.getCrosswordAttributesById(a.id)
                let a2 = CrosswordService.getCrosswordAttributesById(b.id)
                if (a1["complete"] && a2["complete"]) {
                    return 0
                } else if (a1["complete"]) {
                    return desc ? -1 : 1
                } else if (a2["complete"]) {
                    return desc ? 1 : -1
                } else if (a1["progress"] === a2["progress"]) {
                    let diff = a1["seconds"] - a2["seconds"]
                    return desc ? -diff : diff
                } else {
                    let diff = a1["progress"] - a2["progress"]
                    return desc ? -diff : diff
                }
            }
        } else if (sortType == 3) {
            sortFunc = function(a,b) {
                let d1 = ratings.find(r => r.crosswordId === a.id).difficultyScore
                let d2 = ratings.find(r => r.crosswordId === b.id).difficultyScore
                if (d1 === d2) return 0
                else if (desc && d1 < d2 || !desc && d1 >= d2) {
                    return 1
                } else {
                    return -1
                }
            }
        } else if (sortType == 4) {
            sortFunc = function(a,b) {
                let r1 = ratings.find(r => r.crosswordId === a.id).enjoymentScore
                let r2 = ratings.find(r => r.crosswordId === b.id).enjoymentScore
                if (r1 === r2) return 0
                else if (desc && r1 < r2 || !desc && r1 >= r2) {
                    return 1
                } else {
                    return -1
                }
            }
        }

        crosswords.sort(sortFunc)

        return (
            <Fragment>
                <CrosswordNavBar />
                <div className="crossword-header-page-wrapper">
                    <div className="crossword-header-page-intro">
                        <div className="crossword-header-page-intro-header">Dive into some full-sized themed crosswords.</div>
                        <div className="crossword-header-page-intro-body">Customize your settings and start solving. Don't worry if you get stuck, you can always check or reveal some answers to help you along your way.
                                Hit pause if you need a break, your game will be saved when you come back (on this device or another).</div>
                        <div className="crossword-header-page-intro-stats">
                            <div className="crossword-header-page-stats-box">
                                <div className="crossword-header-page-stats-box-number">{complete}</div>
                                <div className="crossword-header-page-stats-box-title">Completed</div>
                            </div>
                            <div className="crossword-header-page-stats-box-divider"></div>
                            <div className="crossword-header-page-stats-box">
                                <div className="crossword-header-page-stats-box-number">{inProgress}</div>
                                <div className="crossword-header-page-stats-box-title">In progress</div>
                            </div>
                            <div className="crossword-header-page-stats-box-divider"></div>
                            <div className="crossword-header-page-stats-box">
                                <div className="crossword-header-page-stats-box-number">{notStarted}</div>
                                <div className="crossword-header-page-stats-box-title">Not started</div>
                            </div>
                        </div>
                    </div>
                    { window.innerWidth < 700 ? null :
                        <div className="crossword-header-page-sort-dropdown-section">
                            <div className="crossword-header-page-sort-by">Sort by ... </div>
                            <DropdownButton id="crossword-header-page-sort-dropdown"
                                title={<div><span className="crossword-header-page-dropdown-title">{this.sortTypes[sortType]}</span>
                                    <FontAwesomeIcon id="sort-type-caret-icon" icon={faAngleDown} /></div>}
                                onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen) }}>
                                <div className="crossword-header-page-dropdown-item-section">
                                    <Dropdown.Item className="crossword-header-page-dropdown-item" as="button" onClick={() => { this.sortTypeClicked(0) }}>{this.sortTypes[0]}</Dropdown.Item>
                                    <div className="crossword-header-page-dropdown-item-divider"></div>
                                    <Dropdown.Item className="crossword-header-page-dropdown-item" as="button" onClick={() => { this.sortTypeClicked(1) }}>{this.sortTypes[1]}</Dropdown.Item>
                                    <div className="crossword-header-page-dropdown-item-divider"></div>
                                    <Dropdown.Item className="crossword-header-page-dropdown-item" as="button" onClick={() => { this.sortTypeClicked(2) }}>{this.sortTypes[2]}</Dropdown.Item>
                                    <div className="crossword-header-page-dropdown-item-divider"></div>
                                    <Dropdown.Item className="crossword-header-page-dropdown-item" as="button" onClick={() => { this.sortTypeClicked(3) }}>{this.sortTypes[3]}</Dropdown.Item>
                                    <div className="crossword-header-page-dropdown-item-divider"></div>
                                    <Dropdown.Item className="crossword-header-page-dropdown-item" as="button" onClick={() => { this.sortTypeClicked(4) }}>{this.sortTypes[4]}</Dropdown.Item>
                                </div>
                            </DropdownButton>
                            <FontAwesomeIcon id="crossword-header-page-sort-order-icon" icon={desc ? faLongArrowAltDown : faLongArrowAltUp} 
                                onClick={() => this.sortOrderClicked()}/>
                        </div>
                    }
                    { crosswords === null || crosswords.length === 0 ? 
                        <div style={{width: "100%", margin: "50px 0 150px 0", textAlign: "center", fontSize: "24pt", fontFamily: "Arial", fontWeight: "bold", opacity: "0.7"}}>
                            Loading Crosswords...
                        </div> :
                        <div className="crossword-header-page-list">
                            {crosswords.map( (c,i) =>
                                <CrosswordHeader 
                                    key={i}
                                    id={c.id}
                                    title={c.title}
                                    date={c.date}
                                    difficulty={c.difficulty}
                                    rating={ratings.find(r => r.crosswordId === c.id)}
                                    height={c.board.grid.length}
                                    width={c.board.grid[0].length}
                                    crosswordSelected={this.props.crosswordSelected}
                                />
                            )}
                        </div>
                    }
                </div>
                { window.innerWidth < 700 ? null : <Footer /> }
            </Fragment>
        )
    }
}

CrosswordHeaderPage.propTypes = {
    crosswords: PropTypes.array.isRequired,
    ratings: PropTypes.array.isRequired,
    crosswordSelected: PropTypes.func.isRequired
}

export default CrosswordHeaderPage