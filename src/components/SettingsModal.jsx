import React, { Fragment, Component } from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'prop-types'
import ColorSchemeList from '../libs/ColorSchemeList.js'
import ColorSchemeRow from './ColorSchemeRow.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import '../css/SettingsModal.css'
import Settings from '../libs/Settings.js'
import api from '../libs/api.js'
import User from '../libs/User.js'

class SettingsModal extends Component {
    constructor (props) {
        super(props)

        this.colorSchemeClicked = this.colorSchemeClicked.bind(this)
        this.inactivityOptionClicked = this.inactivityOptionClicked.bind(this)
        this.soundOptionClicked = this.soundOptionClicked.bind(this)
        this.settingsRestored = this.settingsRestored.bind(this)
        this.saveAndClose = this.saveAndClose.bind(this)
    }

    settingsRestored () {
        if (Settings.isDefault()) {
            return
        }
        Settings.restoreDefaults()
        this.props.settingsSave(Settings)
    }

    colorSchemeClicked (c) {
        if (c.key === Settings.colorScheme.key) {
            return
        }
        Settings.colorScheme = c
        this.props.settingsSave(Settings)
    }

    inactivityOptionClicked (seconds) {
        if (seconds === Settings.timerInactivity) {
            return
        }
        Settings.timerInactivity = seconds
        this.props.settingsSave(Settings)
    }

    soundOptionClicked (yesNo) {
        if (yesNo === Settings.playSound) {
            return
        }
        Settings.playSound = yesNo
        this.props.settingsSave(Settings)
    }

    async saveAndClose () {
        let response
        let requestSuccess
        try {
            let colorSchemeInd = ColorSchemeList.findIndexByKey(Settings.colorScheme.key)
            response = await api.saveSettings(User.token, colorSchemeInd, Settings.timerInactivity, Settings.playSound)
            requestSuccess = response.status === 200
        } catch(error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("There was a network error saving settings")
        } else if (!response.data.success) {
            console.log("There was an error saving settings: " + response.data.error)
        }
        this.props.settingsBack(Settings)
    }

    render () {
        return (
            <div style={{display: `${this.props.shouldShow ? "block" : "none"}`}} className="settings-modal-wrapper">
                <FontAwesomeIcon className="settings-modal-cancel" icon={faTimes} onClick={() => this.saveAndClose()}/>
                <div className="settings-modal-header">Crossword Settings</div>
                <div className="settings-modal-body">
                    <div className="settings-modal-section-title">Color Schemes</div>
                    <div className="color-scheme-row-scroll">
                        {ColorSchemeList.colorSchemes.map( (c,i) =>
                            <div key={i} className="color-scheme-row" 
                                style={{backgroundColor : `${c.key === Settings.colorScheme.key ? "#D0D0D0" : ""}`}}
                                onClick={() => this.colorSchemeClicked(c)}>
                                <div className="color-scheme-row-part">
                                    <div className="color-scheme-row-name">{c.displayName}</div>
                                </div>
                                <div className="color-scheme-row-part">
                                    <ColorSchemeRow className="color-scheme-row-graphic" colorScheme={c} width={170} height={30} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="settings-modal-section-title">Interaction</div>
                    <div className="settings-interaction-scroll">
                        <div className="settings-interaction-section">
                            <div className="settings-interaction-header">Pause game when inactive for...</div>
                            <div className="settings-interaction-body">
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${Settings.timerInactivity === 30 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(30)}>30s</span>
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${Settings.timerInactivity === 60 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(60)}>60s</span>
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${Settings.timerInactivity === 90 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(90)}>90s</span>
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${Settings.timerInactivity === 0 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(0)}>Never</span>
                            </div>
                        </div>
                        <div className="settings-interaction-section">
                            <div className="settings-interaction-header">Play sound on completion?</div>
                            <div className="settings-interaction-body">
                                <span className="interaction-settings-option"
                                    style={{backgroundColor : `${Settings.playSound ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.soundOptionClicked(true)}>Yes</span>
                                <span className="interaction-settings-option"
                                    style={{backgroundColor : `${!Settings.playSound ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.soundOptionClicked(false)}>No</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="settings-modal-footer">
                    <Button disabled={Settings.isDefault()}
                        className="settings-restore-button"
                        onClick={() => this.settingsRestored()}>Restore Defaults</Button>
                </div>
            </div>
        )
    }
}

SettingsModal.propTypes = {
    shouldShow: PropTypes.bool.isRequired,
    settingsSave: PropTypes.func.isRequired,
    settingsBack: PropTypes.func.isRequired
}

export default SettingsModal