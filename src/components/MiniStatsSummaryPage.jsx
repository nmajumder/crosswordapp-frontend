import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'
import MiniStatsService from '../libs/MiniStatsService'
import '../css/MiniStatsSummaryPage.css'
import MiniStatsActivityChart from './MiniStatsActivityChart'

class MiniStatsSummaryPage extends Component {
    constructor (props) {
        super(props)

        this.populated = false

        this.currentStreak = 0
        this.longestStreak = 0
        this.solveRate = 0
        this.puzzlesSolved = 0

        this.populateStats = this.populateStats.bind(this)
    }

    componentDidMount () {
        this.populated = false
        this.populateStats()
    }

    populateStats () {
        if (this.stats === null || this.stats === undefined) return

        // find longest streak
        let prevDate = null
        let tempStreak = 0
        let longStreak = 0
        for (let dateStr in this.stats.activityOverTime) {
            let date = new Date(dateStr + " 06:00:00 EDT")
            if (prevDate === null || date.getDate() === prevDate.getDate() + 1) {
                tempStreak++
            } else {
                if (tempStreak > longStreak) {
                    longStreak = tempStreak
                }
                tempStreak = 1
            }
            prevDate = date
        }
        if (tempStreak > longStreak) {
            longStreak = tempStreak
        }
        this.longestStreak = longStreak

        // find current streak
        let today = new Date()
        let month = today.getMonth() > 8 ? today.getMonth() + 1 : '0' + (today.getMonth() + 1)
        let todayStr = today.getFullYear() + '-' + month + '-' + today.getDate()
        let todayEDT = new Date(todayStr + ' 06:00:00 EDT')
        if (prevDate !== null && prevDate.getDate() === todayEDT.getDate()) {
            this.currentStreak = tempStreak
        } else {
            this.currentStreak = 0
        }

        // find total games and completion percent
        let totalGames = 0
        let startedGames = 0
        for (let i = 0; i < 15; i++) {
            totalGames += this.stats.completedGames[i]
            startedGames += this.stats.startedGames[i]
        }

        this.puzzlesSolved = totalGames
        this.solveRate = startedGames === 0 ? 0 : Math.round((totalGames / startedGames) * 1000) / 10

        this.populated = true
    }

    render () {
        this.stats = MiniStatsService.getLoadedMiniStats()
        if (this.stats === null || this.stats === undefined) return null
        if (this.stats !== null && this.stats !== undefined) {
            if (!this.populated) {
                this.populateStats()
            }
        }

        let screenWid = window.innerWidth
        let maxCols = 10
        maxCols += Math.min(Math.round((screenWid - 1000) / (800 / maxCols)), 20)

        return (
            <Fragment>
                <div className="mini-stats-summary-page-wrapper">
                    <div className="mini-stats-summary-box-section">
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Total Puzzles Solved</div>
                            <div className="mini-stats-summary-box-body">{this.puzzlesSolved}</div>
                        </div>
                        <div className="mini-stats-summary-box-divider"></div>
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Completion Percentage</div>
                            <div className="mini-stats-summary-box-body">{this.solveRate}%</div>
                        </div>
                        <div className="mini-stats-summary-box-divider"></div>
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Current Activity Streak</div>
                            <div className="mini-stats-summary-box-body">
                                {this.currentStreak} Day{this.currentStreak === 1 ? "" : "s"}
                            </div>
                        </div>
                        <div className="mini-stats-summary-box-divider"></div>
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Longest Activity Streak</div>
                            <div className="mini-stats-summary-box-body">
                                {this.longestStreak} Day{this.longestStreak === 1 ? "" : "s"}
                            </div>
                        </div>
                    </div>
                    <MiniStatsActivityChart activityMap={this.stats.activityOverTime} index={null} 
                        chartHeight={"450px"} maxColumns={maxCols}/>
                </div>
            </Fragment>
        )
    }
}

export default MiniStatsSummaryPage