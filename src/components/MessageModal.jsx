import React, { Component, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, OverlayTrigger, Overlay, Tooltip } from 'react-bootstrap'
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import '../css/MessageModal.css'

class MessageModal extends Component {
    constructor (props) {
        super(props)

        this.difRating = null
        this.enjRating = null

        this.primaryButtonPushed = this.primaryButtonPushed.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    componentDidMount () {
        document.addEventListener("keydown", this.onKeyDown, false)
    }

    componentWillUnmount () {
        document.removeEventListener("keydown", this.onKeyDown, false)
    }

    onKeyDown (event) {
        if (event.which === 13) {
            event.preventDefault()
            this.props.buttonAction1()
        }
    }

    primaryButtonPushed () {
        if (this.difRating !== null || this.enjRating !== null) {
            this.props.buttonAction1(this.difRating, this.enjRating)
        } else {
            this.props.buttonAction1()
        }
    }
    
    render () {
        let sliderMarks = []
        for (let i = 1; i <= 10; i++) {
            sliderMarks.push({value: i, label: '' + i})
        }

        if (this.props.board !== undefined && this.props.board !== null) {
            if (this.difRating === null) {
                this.difRating = this.props.board.difficultyRating === 0 ? 5 : this.props.board.difficultyRating
            }
            if (this.enjRating === null) {
                this.enjRating = this.props.board.enjoymentRating === 0 ? 5 : this.props.board.enjoymentRating
            }
        }

        return (
            <div style={{display: `${this.props.message !== "" ? "block" : "none"}`}} className="message-modal-wrapper">
                <div className="message-modal-body">
                    {this.props.message}
                    {this.props.buttonText1 === "Save" ? 
                        <div className="message-modal-rating-section">
                            <Typography id="difficulty-slider">
                                Difficulty Rating
                                <OverlayTrigger
                                    placement="right"
                                    delay={{ show: 100, hide: 400 }}
                                    overlay={
                                        <Tooltip id="difficulty-info-tooltip">
                                            If familiar with NY Times puzzles:<br/>
                                            <div className="difficulty-tooltip-number">1</div>= Monday difficulty<br/>
                                            <div className="difficulty-tooltip-number">10</div>= Saturday difficulty
                                        </Tooltip>
                                    }
                                >
                                   <FontAwesomeIcon id="difficulty-slider-info-icon" style={{fontSize: '13pt', marginLeft: '8px'}} icon={faInfoCircle}/> 
                                </OverlayTrigger>
                            </Typography>
                            <Slider
                                defaultValue={this.difRating}
                                aria-labelledby="difficulty-slider"
                                valueLabelDisplay="auto"
                                step={1}
                                marks={sliderMarks}
                                min={1}
                                max={10}
                                onChangeCommitted={(event, value) => this.difRating = value}
                            />
                            <Typography id="enjoyment-slider">
                                Enjoyment Rating
                            </Typography>
                            <Slider
                                defaultValue={this.enjRating}
                                aria-labelledby="enjoyment-slider"
                                valueLabelDisplay="auto"
                                step={1}
                                marks={sliderMarks}
                                min={1}
                                max={10}
                                onChangeCommitted={(event, value) => this.enjRating = value}
                            />
                        </div>
                    : ""}
                </div>
                <div className="message-modal-footer">
                    {this.props.buttonText1 === "Rate" ? <div className="message-modal-extra-text">
                        Care to help out future solvers and rate this puzzle?</div> 
                        : ""}
                    <Button className="message-modal-button-primary" onClick={() => this.primaryButtonPushed()}>{this.props.buttonText1}</Button>
                    {this.props.buttonText2 !== "" ? <Button className="message-modal-button-secondary" 
                        onClick={() => this.props.buttonAction2()}>{this.props.buttonText2}</Button> : null}
                </div>
            </div>

        )
    }
}

MessageModal.propTypes = {
    message: PropTypes.string.isRequired,
    buttonText1: PropTypes.string.isRequired,
    buttonAction1: PropTypes.func.isRequired,
    buttonText2: PropTypes.string,
    buttonAction2: PropTypes.func,
    board: PropTypes.object
}

export default MessageModal