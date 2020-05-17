import React, { StrictMode, Component } from 'react'
import '../css/StatsApp.css'
import User from '../libs/User.js'
import UserValidation from '../libs/UserValidation.js'
import CrosswordService from '../libs/CrosswordService.js'
import MiniStatsService from '../libs/MiniStatsService.js'
import CrosswordNavBar from './CrosswordNavBar.jsx'
import FullStatsPage from './FullStatsPage.jsx'
import MiniStatsSummaryPage from './MiniStatsSummaryPage.jsx'
import MiniStatsCategoryPage from './MiniStatsCategoryPage.jsx'
import MiniStatsMetricPage from './MiniStatsMetricPage.jsx'

class StatsApp extends Component {
    constructor (props) {
        super(props)

        this.state = {
            selected: 0,
            crosswords: null,
            ministats: null
        }

        this.optionSelected = this.optionSelected.bind(this)
    }

    async componentDidMount () {
        console.log("Validating user from stats page")
        let user = await UserValidation.validateUser()
        let validated = user !== null && user.token !== null && user.email !== null && user.username !== null

        if (!validated) {
            this.props.history.push('/')
        } else {
            let crosswords = await CrosswordService.getAllCrosswords(User.token)
            let ministats = await MiniStatsService.getMiniStats(User.token)
            this.setState({
                crosswords: crosswords,
                ministats: ministats
            })
        }
    }

    optionSelected (opt) {
        this.setState({
            selected: opt
        })
    }

    render () {
        const { selected, crosswords, ministats } = this.state

        let selectedStyle = {borderBottomColor: "#3f84fb"}

        return (
            <StrictMode>
                <CrosswordNavBar/>
                <div className="stats-page-wrapper">
                    <div className="stats-page-options-bar">
                        <div className="stats-page-option option-left" style={selected === 0 ? selectedStyle : {}}
                            onClick={() => this.optionSelected(0)}>
                            Activity Summary
                        </div>
                        <div className="stats-page-option option-right" style={selected === 1 ? selectedStyle : {}}
                            onClick={() => this.optionSelected(1)}>
                            View by Puzzle Category
                        </div>
                        <div className="stats-page-option option-right" style={selected === 2 ? selectedStyle : {}}
                            onClick={() => this.optionSelected(2)}>
                            View by Individual Metric
                        </div>
                    </div>
                    { selected === 0 ? 
                        <MiniStatsSummaryPage /> :
                        selected === 1 ?
                        <MiniStatsCategoryPage /> :
                        <MiniStatsMetricPage />
                    }
                </div>
            </StrictMode>
        )
    }
}

export default StatsApp