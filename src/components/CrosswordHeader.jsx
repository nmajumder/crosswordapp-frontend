import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/CrosswordHeader.css'
import DateUtils from '../libs/DateUtils.js'
import CrosswordService from '../libs/CrosswordService'
import CrosswordHeaderProgressBar from './CrosswordHeaderProgressBar'
import crosswordImages from '../libs/CrosswordImageList.js'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-regular-svg-icons'
import { faInfoCircle, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons'

class CrosswordHeader extends Component {
    constructor (props) {
        super(props)

        this.bannerRef = React.createRef()

        this.state = {
            showHoverText: false,
            showHoverStyle: false,
            flipped: false
        }

        this.getDisplayDate = this.getDisplayDate.bind(this)
        this.overlayHover = this.overlayHover.bind(this)
        this.overlayUnhover = this.overlayUnhover.bind(this)
        this.moreInfoClicked = this.moreInfoClicked.bind(this)
    }

    overlayHover () {
        this.setState({
            showHoverStyle: true
        })
        setTimeout(function() {
            this.setState({
                showHoverText: true
            })
        }.bind(this), 300)
    }
    
    overlayUnhover () {
        this.setState({
            showHoverText: false,
            showHoverStyle: false
        })
    }

    moreInfoClicked (yesNo) {
        this.setState({
            flipped: yesNo
        })
    }

    getDisplayDate(dateStr) {
        let displayDate = DateUtils.getDisplayDate(dateStr)
        return displayDate
    }

    render () {
        let attr = CrosswordService.getCrosswordAttributesById(this.props.id)
        let status
        if (attr["complete"]) {
            status = "Complete"
        } else if (attr["percent"] === 0 && attr["seconds"] === 0) {
            status = "Not Started"
        } else {
            status = "In Progress"
        }
        let percent = attr["percent"]
        let checkOrReveal = attr["checked"] || attr["revealed"]
        let seconds = attr["seconds"]

        let backgroundColor = "black"
        if (status === "Complete") {
            backgroundColor = "#e6cc50"
        } else if (status === "In Progress") {
            backgroundColor = "#81a8eb"
        } else {
            backgroundColor = "#C0C0C0"
        }

        let overlayText = "View Puzzle"
        if (status === "In Progress") overlayText = "Resume Puzzle"
        else if (status === "Not Started") overlayText = "Start Puzzle"

        let crosswordInd = parseInt(this.props.id, 10)
        let image = crosswordImages[crosswordInd-1]["src"]
        let backgroundImageStyle = {
            background: `url(${image})`, 
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
        }

        let rating = this.props.rating

        return (
            <Fragment>
                <div className="crossword-header-flip-card">
                    <div className="crossword-header-background" style={backgroundImageStyle}></div>
                    <div className="crossword-header-background-overlay"></div>
                    <div className={this.state.flipped ? "crossword-header-flip-card-inner flip-card-flipped" : "crossword-header-flip-card-inner"}>
                        <div className={this.state.flipped ? "crossword-header-front hidden" : "crossword-header-front"}
                            onMouseEnter={() => this.overlayHover()} onMouseLeave={() => this.overlayUnhover()}>
                            <div className={this.state.showHoverStyle ? "crossword-header-overlay crossword-header-overlay-hover" : "crossword-header-overlay"}>
                                <FontAwesomeIcon id="info-icon-overlay" icon={faInfoCircle} onClick={() => this.moreInfoClicked(true)} />
                            </div>
                            <div className="crossword-header-text-section">
                                <div className={this.state.showHoverStyle ? "crossword-header-title header-title-hover" : "crossword-header-title header-transition"}>{this.props.title}</div>
                                <div className={this.state.showHoverStyle ? "crossword-header-date header-date-hover" : "crossword-header-date header-transition"}>{this.getDisplayDate(this.props.date)}</div>
                                <div className={this.state.showHoverStyle ? "crossword-header-size header-size-hover" : "crossword-header-size header-transition"}>
                                    {this.props.height} x {this.props.width}
                                </div>
                                <div ref={this.bannerRef} onClick={() => { this.props.crosswordSelected(this.props.id) }}
                                    className={this.state.showHoverStyle ? "crossword-header-start-banner banner-show" : "crossword-header-start-banner"}>
                                        {this.state.showHoverText ? overlayText : ""}
                                    </div>
                            </div>
                            <div className="crossword-header-progress">
                                <CrosswordHeaderProgressBar 
                                    status={status} 
                                    percent={percent} 
                                    seconds={seconds}
                                    checkOrReveal={checkOrReveal} />
                            </div>
                        </div>
                        <div className="crossword-header-back">
                            <div className="crossword-header-back-layer"></div>
                            <FontAwesomeIcon id="back-icon-flipped" icon={faArrowCircleLeft} onClick={() => this.moreInfoClicked(false)} />
                            <div className="crossword-header-back-title">User Ratings</div>
                            <div className="crossword-header-back-score-section">
                                <div className="crossword-header-back-score-header">Average User Difficulty Score:</div>
                                <div className="crossword-header-back-score">
                                    {rating.numDifficultyRatings > 0 ? `${rating.difficultyScore} / 10 ` : "N/A "} 
                                    ({rating.numDifficultyRatings} Rating{rating.numDifficultyRatings === 1 ? "" : "s"})
                                </div>
                            </div>
                            <div className="crossword-header-back-score-section">
                                <div className="crossword-header-back-score-header">Average User Enjoyment Rating:</div>
                                <div className="crossword-header-back-score">
                                    {rating.numEnjoymentRatings > 0 ? `${rating.enjoymentScore} / 10 ` : "N/A "} 
                                    ({rating.numEnjoymentRatings} Rating{rating.numEnjoymentRatings === 1 ? "" : "s"})
                                </div>
                            </div>
                        </div>
                    </div>
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
    rating: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    crosswordSelected: PropTypes.func.isRequired
}

export default CrosswordHeader