import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/Keyboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackspace } from '@fortawesome/free-solid-svg-icons'

class Keyboard extends Component {
    constructor (props) {
        super(props)

        this.state = {
            layout: "letters"
        }

        this.handleButtonPress = this.handleButtonPress.bind(this)
    }

    handleButtonPress (event) {
        if (event.target.innerText === '123') {
            this.setState({
                layout: "numbers"
            })
        } else if (event.target.innerText === 'abc') {
            this.setState({
                layout: "letters"
            })
        } else {
            if (event.target.innerText === undefined) {
                this.props.onKeyPress('Backspace')
            } else {
                this.props.onKeyPress(event.target.innerText)
            }
        }
    }

    render () {
        const { layout } = this.state

        let r1, r2, r3
        if (layout === "letters") {
            r1 = ['Q','W','E','R','T','Y','U','I','O','P']
            r2 = ['A','S','D','F','G','H','J','K','L']
            r3 = ['123','Z','X','C','V','B','N','M','<']
        } else {
            r1 = ['1','2','3','4','5','6','7','8','9','0']
            r2 = ['@','#','$','%','&','*','-','+','=']
            r3 = ['abc',',',':','/','<']
        }
        const keyboardRows = [r1, r2, r3]

        return (
            <Fragment>
                <div className="keyboard-wrapper">
                    { keyboardRows.map( (row, i) =>
                        <div className="keyboard-row" key={i}>
                            { row.map( (key, j) =>
                                <div className={`keyboard-btn ${key === '123' || key === 'abc' || key === '<' ? 'keyboard-btn-wide' : ''}`} 
                                    key={j} onClick={(evt) => this.handleButtonPress(evt)}>
                                    {key !== '<' ? key :
                                    <FontAwesomeIcon id="keyboard-backspace-icon" icon={faBackspace}/>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Fragment>
        )
    }
}

Keyboard.propTypes = {
    onKeyPress: PropTypes.func.isRequired
}

export default Keyboard