import React, { Fragment, Component } from 'react'
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
import Footer from './Footer'
import LoadingModal from './LoadingModal'
import MobileView from './MobileView'

class StatsApp extends Component {
    constructor (props) {
        super(props)

        this.state = {
            selected: 0,
            crosswords: null,
            ministats: null,
            loading: false
        }

        this.optionSelected = this.optionSelected.bind(this)
    }

    async componentDidMount () {
        console.log("Validating user from stats page")
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
        const { selected, crosswords, ministats, loading } = this.state

        if (window.innerWidth < 900) {
            return (
                <Fragment>
                    <CrosswordNavBar />
                    <MobileView page="stats" />
                </Fragment>
            )
        }


        let selectedStyle = {borderBottomColor: "#3f84fb"}

        return (
            <Fragment>
                <LoadingModal shouldShow={loading} />
                <CrosswordNavBar blurred={loading}/>
                <div className="stats-page-wrapper" style={{filter: loading ? "blur(5px)" : ""}}>
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
                    { ministats === null ? 
                        <div style={{width: "100%", marginTop: "100px", textAlign: "center", fontSize: "24pt", fontFamily: "Arial", fontWeight: "bold", opacity: "0.7"}}>
                            Loading Statistics...
                        </div> :
                        selected === 0 ? 
                            <MiniStatsSummaryPage /> :
                            selected === 1 ?
                                <MiniStatsCategoryPage /> :
                                <MiniStatsMetricPage />
                    
                    }
                </div>
                { window.innerWidth < 700 ? null : <Footer blur={loading} /> }
            </Fragment>
        )
    }
}

export default StatsApp