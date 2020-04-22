import React, { Fragment, Component } from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'prop-types'
import ColorSchemeList from '../libs/ColorSchemeList.js'
import ColorSchemeRow from './ColorSchemeRow.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import '../css/SettingsModal.css'
import Settings from '../libs/Settings.js'

class SettingsModal extends Component {
    constructor (props) {
        super(props)

        this.state = {
            settings: this.props.settings
        }

        this.colorSchemeClicked = this.colorSchemeClicked.bind(this)
        this.inactivityOptionClicked = this.inactivityOptionClicked.bind(this)
        this.soundOptionClicked = this.soundOptionClicked.bind(this)
        this.showTimerClicked = this.showTimerClicked.bind(this)

        this.settingsRestored = this.settingsRestored.bind(this)
        this.settingsAreDefault = this.settingsAreDefault.bind(this)
    }

    settingsRestored () {
        if (this.settingsAreDefault(this.state.settings)) {
            return
        }
        let newSettings = this.state.settings
        newSettings.restoreDefaults()
        this.setState({
            settings: newSettings
        })
        this.props.settingsSave(this.state.settings)
    }

    settingsAreDefault () {
        return this.state.settings.isDefault()
    }

    colorSchemeClicked (c) {
        if (c.key === this.state.settings.colorScheme.key) {
            return
        }
        let newSettings = this.state.settings
        newSettings.colorScheme = c
        this.setState({
            settings: newSettings
        })
        this.props.settingsSave(this.state.settings)
    }

    inactivityOptionClicked (seconds) {
        if (seconds === this.state.settings.timerInactivity) {
            return
        }
        let newSettings = this.state.settings
        newSettings.timerInactivity = seconds
        this.setState({
            settings: newSettings
        })
        this.props.settingsSave(this.state.settings)
    }

    soundOptionClicked (yesNo) {
        if (yesNo === this.state.settings.playSound) {
            return
        }
        let newSettings = this.state.settings
        newSettings.playSound = yesNo
        this.setState({
            settings: newSettings
        })
        this.props.settingsSave(this.state.settings)
    }

    showTimerClicked (yesNo) {
        if (yesNo === this.state.settings.showTimer) {
            return
        }
        let newSettings = this.state.settings
        newSettings.showTimer = yesNo
        this.setState({
            settings: newSettings
        })
        this.props.settingsSave(this.state.settings)
    }

    render () {
        const { savedSettings, settings } = this.state
        return (
            <div style={{display: `${this.props.shouldShow ? "block" : "none"}`}} className="settings-modal-wrapper">
                <FontAwesomeIcon className="settings-modal-cancel" icon={faTimes} onClick={() => this.props.settingsBack()}/>
                <div className="settings-modal-header">Crossword Settings</div>
                <div className="settings-modal-body">
                    <div className="settings-modal-section-title">Color Schemes</div>
                    <div className="color-scheme-row-scroll">
                        {ColorSchemeList.colorSchemes.map( (c,i) =>
                            <div key={i} className="color-scheme-row" 
                                style={{backgroundColor : `${c.key === settings.colorScheme.key ? "#D0D0D0" : ""}`}}
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
                                    style={{backgroundColor : `${settings.timerInactivity === 30 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(30)}>30s</span>
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${settings.timerInactivity === 60 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(60)}>60s</span>
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${settings.timerInactivity === 90 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(90)}>90s</span>
                                <span className="interaction-settings-option" 
                                    style={{backgroundColor : `${settings.timerInactivity === 0 ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.inactivityOptionClicked(0)}>Never</span>
                            </div>
                        </div>
                        <div className="settings-interaction-section">
                            <div className="settings-interaction-header">Play sound on completion?</div>
                            <div className="settings-interaction-body">
                                <span className="interaction-settings-option"
                                    style={{backgroundColor : `${settings.playSound ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.soundOptionClicked(true)}>Yes</span>
                                <span className="interaction-settings-option"
                                    style={{backgroundColor : `${!settings.playSound ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.soundOptionClicked(false)}>No</span>
                            </div>
                        </div>
                        <div className="settings-interaction-section">
                            <div className="settings-interaction-header">Show timer?</div>
                            <div className="settings-interaction-body">
                                <span className="interaction-settings-option"
                                    style={{backgroundColor : `${settings.showTimer ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.showTimerClicked(true)}>Yes</span>
                                <span className="interaction-settings-option"
                                    style={{backgroundColor : `${!settings.showTimer ? "#D0D0D0" : ""}`}}
                                    onClick={() => this.showTimerClicked(false)}>No</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="settings-modal-footer">
                    <Button disabled={this.settingsAreDefault()}
                        className="modal-footer-btn settings-restore-button"
                        onClick={() => this.settingsRestored()}>Restore Defaults</Button>
                </div>
            </div>
        )
    }
}

SettingsModal.propTypes = {
    shouldShow: PropTypes.bool.isRequired,
    settings: PropTypes.object.isRequired,
    settingsSave: PropTypes.func.isRequired,
    settingsBack: PropTypes.func.isRequired
}

export default SettingsModal