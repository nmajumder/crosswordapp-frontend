import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/Timer.css'

class Timer extends Component {
    constructor (props) {
        super(props)

        this.state = {
            elapsed: this.props.startingValue
        }
    }

    componentDidMount () {
        this.timerInterval = setInterval(() => {
            if (!this.props.isPaused) {
                this.setState(({ elapsed }) => ({
                    elapsed: elapsed + 1
                }))
                this.props.getValue(this.state.elapsed)
            }
        }, 1000)
    }

    componentWillUnmount () {
        clearInterval(this.timerInterval)
    }

    render () {
        const { elapsed } = this.state
        let seconds = elapsed
        let minutes = 0
        let hours = 0
        if (seconds >= 60) {
            minutes = Math.floor(seconds / 60)
            seconds = seconds % 60
            if (minutes >= 60) {
                hours = Math.floor(minutes / 60)
                minutes = minutes % 60
            }
        }

        let secondStr = seconds < 10 ? "0" + seconds : "" + seconds
        let minuteStr = "" + minutes
        if (hours > 0) {
            minuteStr = minutes < 10 ? "0" + minutes : "" + minutes
        }
        let hourStr = "" + hours

        return (
            <div className="crossword-timer">
                {hours > 0 ? hourStr + ":" : ""}{minuteStr}:{secondStr}
            </div>
        )
    }
}

Timer.propTypes = {
    isPaused: PropTypes.bool.isRequired,
    startingValue: PropTypes.number.isRequired,
    getValue: PropTypes.func.isRequired
}

export default Timer