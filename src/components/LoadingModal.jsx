import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/LoadingModal.css'

class LoadingModal extends Component {

    render () {
        if (!this.props.shouldShow) {
            return null
        } else {
            return (
                <Fragment>
                    <div className="loading-modal-overlay" />
                    <div className="loading-modal-wrapper">
                        <div className="loading-modal-text">Just a sec, attempting to log you in...</div>
                    </div>
                </Fragment>
            )
        }
    }
}

LoadingModal.propTypes = {
    shouldShow: PropTypes.bool.isRequired
}

export default LoadingModal