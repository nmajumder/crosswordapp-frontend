import React, { StrictMode, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordPage from './CrosswordPage.jsx'
import CrosswordHeaderPage from './CrosswordHeaderPage.jsx'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import api from '../libs/api.js'
import UserValidation from '../libs/UserValidation.js'
import User from '../libs/User.js'
import CrosswordService from '../libs/CrosswordService.js'

class FullCrosswordApp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            crosswords: [],
            selectedCrossword: null,
        }

        this.crosswordSelected = this.crosswordSelected.bind(this)
    }

    async componentDidMount () {
        console.log("Validating user from crosswords page")
        let user = await UserValidation.validateUser()
        let validated = user !== null && user.token !== null && user.email !== null && user.username !== null

        if (!validated) {
            this.props.history.push('/')
        } else {
            let crosswords = await CrosswordService.getAllCrosswords(User.token)
            this.setState({
                crosswords: crosswords
            })
        }
    }

    componentWillReceiveProps (props) {
        if (props.location.home === true) {
            this.setState({
                selectedCrossword: null
            })
        }
    }

    crosswordSelected (crosswordId) {
        let selectedCrossword = CrosswordService.getCrosswordById(crosswordId)
        this.setState({
            selectedCrossword: selectedCrossword
        })
    }

    render () {
        let { crosswords, selectedCrossword } = this.state

        if (selectedCrossword) {
            return (
                <StrictMode>
                    <CrosswordPage 
                        crossword={selectedCrossword} />
                </StrictMode>
            )
        } else {
            return (
                <StrictMode>
                    <CrosswordHeaderPage 
                        crosswords={crosswords}
                        crosswordSelected={this.crosswordSelected} />
                </StrictMode>
            )
        }
    }
}

export default FullCrosswordApp