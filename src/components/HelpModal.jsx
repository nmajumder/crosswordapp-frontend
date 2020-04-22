import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import '../css/SettingsModal.css'

class HelpModal extends Component {
    render () {
        return (
            <div style={{display: `${this.props.shouldShow ? "block" : "none"}`}} className="settings-modal-wrapper">
                <FontAwesomeIcon className="settings-modal-cancel" icon={faTimes} onClick={() => this.props.helpBack()}/>
                <div className="settings-modal-header">Crossword Controls</div>
                <div className="settings-modal-body">
                    <div></div>
                </div>
                <div className="settings-modal-footer">
                    <div></div>
                </div>
            </div>
        )
    }
}

HelpModal.propTypes = {
    shouldShow: PropTypes.bool.isRequired,
    helpBack: PropTypes.func.isRequired
}

export default HelpModal