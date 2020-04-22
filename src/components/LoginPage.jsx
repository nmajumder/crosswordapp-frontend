import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/LoginPage.css'
import api from '../libs/api.js'

class LoginPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: "",
            password: ""
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleUsernameChange(event) {
        this.setState({
            username: event.target.value
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value
        });
    }

    async handleSubmit () {
        let response
        let requestSuccess = false
        try {
            console.log('Creating user... ' + this.state.username + ', ' + this.state.password)
            response = await api.createUser(this.state.username, this.state.password)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Unable to create user")
        } else {
            console.log("Created user successfully")
            this.props.closeSelected()
        }
    }

    render () {
        return (
            <Fragment>
                <div className="login-page-wrapper">
                    <form className="login-modal" onSubmit={this.handleSubmit}>
                        <label>
                            Username: <input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
                        </label>
                        <label>
                            Password: <input type="text" value={this.state.password} onChange={this.handlePasswordChange} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            </Fragment>
        )
    }
}

LoginPage.propTypes = {
    closeSelected: PropTypes.func.isRequired
}

export default LoginPage