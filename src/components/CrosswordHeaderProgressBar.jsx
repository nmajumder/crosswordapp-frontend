import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import '../css/CrosswordHeaderProgressBar.css'
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons'

class CrosswordHeaderProgressBar extends Component {

    render () {
        let percent = Math.round(this.props.percent * 10) / 10     
        let percentWid = percent + '%'

        let backgroundColor = "black"
        if (this.props.status === "Complete") {
            backgroundColor = "#c4a200"
        } else if (this.props.status === "In Progress") {
            backgroundColor = "#3f84fb"
        } else {
            backgroundColor = "#454545"
        }

        let elapsedTime = ""
        let seconds = this.props.seconds
        if (this.props.status !== "Not Started") {
            let h = Math.floor(seconds / 3600)
            if (h > 0) {
                elapsedTime += h + ":"
                seconds -= h*3600
            }

            let m = Math.floor(seconds / 60)
            if (h > 0 && m < 10) {
                elapsedTime += "0"
            }
            elapsedTime += m + ":"
            seconds -= m*60

            if (seconds < 10) {
                elapsedTime += "0"
            }
            elapsedTime += seconds + ""
        }

        let wrapperStyle = {borderColor: backgroundColor}
        let percentBarStyle = {width: percentWid, height: "100%", backgroundColor: backgroundColor}

        let rowText
        switch(this.props.status) {
            case "Complete":
                rowText = "Complete (" + elapsedTime + ")"
                break
            case "In Progress":
                rowText = "In Progress (" + percentWid + ", " + elapsedTime + ")"
                break
            case "Not Started":
                rowText = "Not Started"
                break
        }

        return (
            <Fragment>
                <div className="header-progress-bar-wrapper" style={wrapperStyle}>
                    <div className="header-progress-bar-full-fill"></div>
                    <div className="header-progress-bar-percent-fill"
                        style={percentBarStyle}></div>
                    <div className="header-progress-bar-text">
                        {rowText}
                    </div>
                </div>
            </Fragment>
        )
    }
}

CrosswordHeaderProgressBar.propTypes = {
    status: PropTypes.string.isRequired,
    percent: PropTypes.number.isRequired,
    seconds: PropTypes.number.isRequired,
    checkOrReveal: PropTypes.bool.isRequired
}

export default CrosswordHeaderProgressBar