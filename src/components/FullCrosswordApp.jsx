import React, { StrictMode, Component } from 'react'
import PropTypes from 'prop-types'
import CrosswordPage from './CrosswordPage.jsx'
import CrosswordHeaderPage from './CrosswordHeaderPage.jsx'
import api from '../libs/api.js'

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
        this.setState((state) => {
            return {
                selectedCrossword: selectedCrossword
            }
        })
    }

    crosswordDeselected () {
        this.setState((state) => {
            return {
                selectedCrossword: null
            }
        })
    }

    render () {
        const { crosswords, selectedCrossword } = this.state

        if (selectedCrossword) {
            return (
                <StrictMode>
                    <CrosswordPage 
                        crossword={selectedCrossword} 
                        backSelected={this.crosswordDeselected}/>
                </StrictMode>
            )
        } else {
            return (
                <StrictMode>
                    <CrosswordHeaderPage 
                        crosswords={crosswords}
                        crosswordSelected={this.crosswordSelected}
                        backSelected={this.props.backSelected} />
                </StrictMode>
            )
        }
    }
}

FullCrosswordApp.propTypes = {
    backSelected: PropTypes.func.isRequired
}

export default FullCrosswordApp