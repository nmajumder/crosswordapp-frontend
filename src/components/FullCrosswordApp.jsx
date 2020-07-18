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
import Footer from './Footer.jsx'
import LoadingModal from './LoadingModal.jsx'

class FullCrosswordApp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            crosswords: [],
            ratings: [],
            selectedCrossword: null,
            loading: false
        }

        this.crosswordSelected = this.crosswordSelected.bind(this)
    }

    async componentDidMount () {
        console.log("Validating user from crosswords page")
        this.setState({
            loading: true
        })
        let user = await UserValidation.validateUser()
        let validated = user !== null && user.token !== null && user.email !== null && user.username !== null

        this.setState({
            loading: false
        })
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

    async componentWillReceiveProps (props) {
        let ratings = await RatingsService.getRatings()
        if (props.location.home === true) {
            this.setState({
                ratings: ratings,
                selectedCrossword: null
            })
        } else {
            this.setState({
                ratings: ratings
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
        let { crosswords, ratings, selectedCrossword, loading } = this.state

        let loadingStyle = {filter: "blur(5px)", pointerEvents: "none"}
        return (
            <Fragment>
                <LoadingModal shouldShow={loading} />
                <div style={loading ? loadingStyle : {}}>
                { selectedCrossword ? 
                    <CrosswordPage 
                    crossword={selectedCrossword} /> :
                    <CrosswordHeaderPage 
                        crosswords={crosswords}
                        ratings={ratings}
                        crosswordSelected={this.crosswordSelected} />
                }
                </div>
            </Fragment>
        )
    }
}

export default FullCrosswordApp