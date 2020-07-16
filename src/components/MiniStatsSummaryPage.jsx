import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'
import MiniStatsService from '../libs/MiniStatsService'
import '../css/MiniStatsSummaryPage.css'
import MiniStatsActivityChart from './MiniStatsActivityChart'

class MiniStatsSummaryPage extends Component {
    constructor (props) {
        super(props)

    }

    render () {
        let stats = MiniStatsService.getLoadedMiniStats()
        if (stats === null || stats === undefined) return null

        const longestStreak = stats.longestStreak
        const currentStreak = stats.currentStreak
        let totalGames = 0
        let startedGames = 0
        for (let i = 0; i < 15; i++) {
            totalGames += stats.categoryStats[i].completed
            startedGames += stats.categoryStats[i].started
        }
        const puzzlesSolved = totalGames
        const solveRate = startedGames === 0 ? 0 : Math.round((totalGames / startedGames) * 1000) / 10

        let screenWid = window.innerWidth
        let maxCols = 10
        maxCols += Math.min(Math.round((screenWid - 1000) / (800 / maxCols)), 20)

        return (
            <Fragment>
                <div className="mini-stats-summary-page-wrapper">
                    <div className="mini-stats-summary-box-section">
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Total Puzzles Solved</div>
                            <div className="mini-stats-summary-box-body">{puzzlesSolved}</div>
                        </div>
                        <div className="mini-stats-summary-box-divider"></div>
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Completion Percentage</div>
                            <div className="mini-stats-summary-box-body">{solveRate}%</div>
                        </div>
                        <div className="mini-stats-summary-box-divider"></div>
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Current Activity Streak</div>
                            <div className="mini-stats-summary-box-body">
                                {currentStreak} Day{currentStreak === 1 ? "" : "s"}
                            </div>
                        </div>
                        <div className="mini-stats-summary-box-divider"></div>
                        <div className="mini-stats-summary-box">
                            <div className="mini-stats-summary-box-header">Longest Activity Streak</div>
                            <div className="mini-stats-summary-box-body">
                                {longestStreak} Day{longestStreak === 1 ? "" : "s"}
                            </div>
                        </div>
                    </div>
                    { puzzlesSolved === 0 ? 
                        <div className="mini-stats-summary-no-data">
                            You have no completed mini puzzles yet. Go to the minis tab above to get started!
                        </div> :
                        <MiniStatsActivityChart stats={stats} size={null} difficulty={null}
                            chartHeight={450} maxColumns={maxCols}/>
                    }
                </div>
            </Fragment>
        )
    }
}

export default MiniStatsSummaryPage