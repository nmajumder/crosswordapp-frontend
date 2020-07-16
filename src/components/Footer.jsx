import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/Footer.css'
import api from '../libs/api.js'
import User from '../libs/User.js'
import { ButtonGroup, ToggleButton, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-regular-svg-icons'
import { faTimes, faAngleRight, faAngleDown } from '@fortawesome/free-solid-svg-icons'

class Footer extends Component {
    constructor(props) {
        super(props)

        this.issueTexts = ["Comment", "Suggestion", "Bug to report", "Other"]
        this.issueTypes = ["Comment", "Suggestion", "Bug", "Other"]

        this.state = {
            open: false,
            comment: "",
            issueType: 0,
            submitted: false
        }

        this.openCaretClicked = this.openCaretClicked.bind(this)
        this.issueTypeChanged = this.issueTypeChanged.bind(this)
        this.commentWritten = this.commentWritten.bind(this)
        this.commentSubmitted = this.commentSubmitted.bind(this)
    }

    openCaretClicked () {
        this.setState({
            open: !this.state.open
        })
    }

    issueTypeChanged (type) {
        this.setState({
            issueType: type
        })
    }

    commentWritten (event) {
        this.setState({
            comment: event.target.value,
            submitted: false
        })
    }

    commentSubmitted () {
        api.submitComment(User.token, this.issueTypes[this.state.issueType], this.state.comment)
        this.setState({
            comment: "",
            submitted: true
        })
    }

    render () {
        const { open, comment, issueType, submitted } = this.state

        return (
            <Fragment>
                <div className="footer-wrapper" style={{filter: this.props.blur ? "blur(5px)" : ""}}>
                    <FontAwesomeIcon icon={open ? faAngleDown : faAngleRight} className="footer-open-caret" onClick={() => this.openCaretClicked()} />
                    <div className="footer-header">
                        <FontAwesomeIcon className="footer-comment-icon" icon={faComments} />
                        <div className="footer-header-text">Have a comment or suggestion for the site? Find a bug that needs fixing? Tell me about it in a private message below!</div>
                    </div>
                    <div style={{display: open ? "" : "none"}}>
                        <div className="footer-input-section">
                            <div className="footer-toggle-describer">I have a </div>
                            <ButtonGroup toggle id="footer-toggle-group">
                                { this.issueTexts.map((text, i) =>
                                    <ToggleButton key={i} type="radio" checked={issueType === i} className="footer-toggle-button" onChange={() => this.issueTypeChanged(i)}> {text}</ToggleButton>
                                )}
                            </ButtonGroup>
                            <textarea className="footer-input-box" type="text" value={comment} onChange={this.commentWritten} />
                        </div>
                        { submitted ? 
                            <Alert className="footer-alert-success" variant="success">
                                <FontAwesomeIcon icon={faTimes} id="footer-alert-success-close" onClick={() => this.setState({ submitted: false })}/>
                                Success, thanks for the feedback!
                            </Alert> :
                            <div className={`footer-submit-button ${comment === "" ? "footer-submit-button-disabled" : ""}`} onClick={() => this.commentSubmitted()}>Submit</div>
                        }
                    </div>
                </div>
            </Fragment>
        )
    }
}

Footer.propTypes = {
    blur: PropTypes.bool
}

export default Footer