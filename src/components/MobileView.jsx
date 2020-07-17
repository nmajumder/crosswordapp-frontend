import React, { Component, Fragment } from 'react'
import '../css/MobileView.css'
import crosswordinfinityinverted from '../images/crosswordinfinityinverted.png'

class MobileView extends Component {
    
    render () {
        return (
            <Fragment>
                <div className="mobile-nav-bar">
                    <img className="mobile-logo" src={crosswordinfinityinverted} />
                </div>
                <div className="mobile-error-msg">
                    Welcome to CrosswordInfinity.com!<br/><br/>Unfortunately, the crossword solving features are not available on mobile devices or small screens.
                    Try again on any standard sized computer and get to puzzling!
                </div>
            </Fragment>
        )
    }
}

export default MobileView