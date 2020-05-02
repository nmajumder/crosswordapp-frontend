import React, { StrictMode, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordPage from './CrosswordPage.jsx'
import CrosswordHeaderPage from './CrosswordHeaderPage.jsx'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import api from '../libs/api.js'
import UserValidation from '../libs/UserValidation.js'

class FullCrosswordApp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            crosswords: [],
            selectedCrossword: null,
        }

        this.loadCrosswords = this.loadCrosswords.bind(this)
        this.crosswordSelected = this.crosswordSelected.bind(this)
        this.crosswordDeselected = this.crosswordDeselected.bind(this)
    }

    componentDidMount () {
        this.loadCrosswords()
    }

    componentWillReceiveProps (props) {
        if (props.location.home === true) {
            this.setState({
                selectedCrossword: null
            })
        }
    }

    async loadCrosswords () {
        let response
        let requestSuccess = false
        try {
            console.log('Getting all crosswords...')
            response = await api.getAllCrosswords()
            console.log(response)
            requestSuccess = response.status === 200
        } catch (error) {
            requestSuccess = false
        }

        if (requestSuccess) {
            let crosswords = response.data.sort((a, b) => (a.date < b.date) ? 1 : -1)
            this.setState({
                crosswords: crosswords
            })
        }
    }

    crosswordSelected (crosswordId) {
        let selectedCrossword = this.state.crosswords.find(c => c.id === crosswordId)
        this.setState({
            selectedCrossword: selectedCrossword
        })
    }

    crosswordDeselected () {
        this.setState({
            selectedCrossword: null
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