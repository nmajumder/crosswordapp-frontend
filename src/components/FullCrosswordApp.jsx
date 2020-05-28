import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordPage from './CrosswordPage.jsx'
import CrosswordHeaderPage from './CrosswordHeaderPage.jsx'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import api from '../libs/api.js'
import UserValidation from '../libs/UserValidation.js'
import User from '../libs/User.js'
import CrosswordService from '../libs/CrosswordService.js'
import RatingsService from '../libs/RatingsService.js'

class FullCrosswordApp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            crosswords: [],
            ratings: [],
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
            let ratings = await RatingsService.getRatings()
            console.log(crosswords)
            console.log(ratings)
            this.setState({
                crosswords: crosswords,
                ratings: ratings
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
        let { crosswords, ratings, selectedCrossword } = this.state

        if (selectedCrossword) {
            return (
                <Fragment>
                    <CrosswordPage 
                        crossword={selectedCrossword} />
                </Fragment>
            )
        } else {
            return (
                <Fragment>
                    <CrosswordHeaderPage 
                        crosswords={crosswords}
                        ratings={ratings}
                        crosswordSelected={this.crosswordSelected} />
                </Fragment>
            )
        }
    }
}

export default FullCrosswordApp