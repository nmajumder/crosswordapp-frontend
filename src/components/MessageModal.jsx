import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import '../css/MessageModal.css'

class MessageModal extends Component {
    
    render () {
        console.log("Displaying: " + this.props.message)
        return (
            <div style={{display: `${this.props.message !== "" ? "block" : "none"}`}} className="message-modal-wrapper">
                <div className="message-modal-body">
                    {this.props.message}
                </div>
                <div className="message-modal-footer">
                    <Button className="message-modal-button" onClick={() => this.props.buttonAction1()}>{this.props.buttonText1}</Button>
                    {this.props.buttonText2 !== "" ? <Button className="message-modal-button" 
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
    buttonAction2: PropTypes.string
}

export default MessageModal