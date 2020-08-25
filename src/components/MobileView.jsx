import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import '../css/MobileView.css'
import crosswordinfinityinverted from '../images/crosswordinfinityinverted.png'

const MOBILE_WID = 625

class MobileView extends Component {
    
    render () {
        return (
            <Fragment>
                <div className="mobile-error-msg">
                    Sorry the {this.props.page} page is not currently available on screens of this size.
                    Please try again on any standard sized computer.
                </div>
            </Fragment>
        )
    }
}

MobileView.propTypes = {
    page: PropTypes.string.isRequired
}

export default MobileView