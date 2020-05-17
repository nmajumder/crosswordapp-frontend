import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import '../css/FullStatsPage.css'
import CrosswordService from '../libs/CrosswordService.js'

class FullStatsPage extends Component {

    render () {
        let crosswords = CrosswordService.getAllLoadedCrosswords()
        let notStarted = crosswords.length
        let inProgress = 0
        let complete15 = 0
        let complete21 = 0
        let checkedInProgress = 0
        let checkedComplete = 0
        let revealedInProgress = 0
        let revealedComplete = 0
        let totalTimeComplete15 = 0
        let totalTimeComplete21 = 0
        for (let c of crosswords) {
            let attr = CrosswordService.getCrosswordAttributesById(c.id)
            if (attr["complete"]) {
                if (c.board.grid.length === 15) {
                    complete15++
                    totalTimeComplete15 += attr["seconds"]
                } else if (c.board.grid.length === 21) {
                    complete21++
                    totalTimeComplete21 += attr["seconds"]
                } else {
                    console.log("Uh oh, found non 15x or 21x grid!")
                }
                notStarted--
                if (attr["checked"]) {
                    checkedComplete++
                }
                if (attr["revealed"]) {
                    revealedComplete++
                }
            } else if (attr["seconds"] > 0 || attr["percent"] > 0) {
                inProgress++
                notStarted--
                if (attr["checked"]) {
                    checkedInProgress++
                }
                if (attr["revealed"]) {
                    revealedInProgress++
                }
            }
        }
        let complete = complete15 + complete21

        let checkedInProgressPct = inProgress > 0 ? Math.round((checkedInProgress / inProgress) * 1000) / 10 + "%" : "N/A"
        let revealedInProgressPct = inProgress > 0 ? Math.round((revealedInProgress / inProgress) * 1000) / 10 + "%" : "N/A"

        let checkedCompletePct = complete > 0 ? Math.round((checkedComplete / complete) * 1000) / 10 + "%" : "N/A"
        let revealedCompletePct = complete > 0 ? Math.round((revealedComplete / complete) * 1000) / 10 + "%" : "N/A"

        let timeCompleteAvg15 = complete15 > 0 ? Math.round(totalTimeComplete15 / complete15) : "N/A"
        let timeCompleteAvg21 = complete21 > 0 ? Math.round(totalTimeComplete21 / complete21) : "N/A"

        if (timeCompleteAvg15 !== "N/A") {
            let hours = Math.floor(timeCompleteAvg15 / 3600)
            if (hours !== 0) {
                timeCompleteAvg15 -= hours * 3600
            }

            let minutes = Math.floor(timeCompleteAvg15 / 60)
            if (minutes !== 0) {
                timeCompleteAvg15 -= minutes * 60
            }

            let seconds = timeCompleteAvg15

            timeCompleteAvg15 = `${hours > 0 ? hours + ":" : ""}${minutes >= 10 ? minutes + ":" : "0" + minutes + ":"}${seconds >= 10 ? seconds : "0" + seconds}` 
        }
        if (timeCompleteAvg21 !== "N/A") {
            let hours = Math.floor(timeCompleteAvg21 / 3600)
            if (hours !== 0) {
                timeCompleteAvg21 -= hours * 3600
            }

            let minutes = Math.floor(timeCompleteAvg21 / 60)
            if (minutes !== 0) {
                timeCompleteAvg21 -= minutes * 60
            }

            let seconds = timeCompleteAvg21

            timeCompleteAvg21 = `${hours > 0 ? hours + ":" : ""}${minutes >= 10 ? minutes + ":" : "0" + minutes + ":"}${seconds >= 10 ? seconds : "0" + seconds}`
        }
        
        return (
            <Fragment>
                <div className="full-stats-page-wrapper">
                    <div className="full-stats-section">
                        <div className="full-stats-column-title">Totals</div>
                        <div className="full-stats-row">
                            <div className="full-stats-header">Completed puzzles:</div>
                            <div className="full-stats-count">{complete}</div>
                        </div>
                        <div className="full-stats-row">
                            <div className="full-stats-header">In progress puzzles:</div>
                            <div className="full-stats-count">{inProgress}</div>
                        </div>
                        <div className="full-stats-row">
                            <div className="full-stats-header">Not started puzzles:</div>
                            <div className="full-stats-count">{notStarted}</div>
                        </div>
                    </div>
                    <div className="full-stats-section">
                        <div className="full-stats-column-title">In Progress ({inProgress})</div>
                        <div className="full-stats-row row-pct">
                            <div className="full-stats-header">Check feature used:</div>
                            <div className="full-stats-count count-pct">{checkedInProgressPct}</div>
                        </div>
                        <div className="full-stats-row row-pct">
                            <div className="full-stats-header">Reveal feature used:</div>
                            <div className="full-stats-count count-pct">{revealedInProgressPct}</div>
                        </div>
                    </div>
                    <div className="full-stats-section">
                        <div className="full-stats-column-title">Completed ({complete})</div>
                        <div className="full-stats-row row-pct">
                            <div className="full-stats-header">Check feature used:</div>
                            <div className="full-stats-count count-pct">{checkedCompletePct}</div>
                        </div>
                        <div className="full-stats-row row-pct">
                            <div className="full-stats-header">Reveal feature used:</div>
                            <div className="full-stats-count count-pct">{revealedCompletePct}</div>
                        </div>
                        <div className="full-stats-row row-pct">
                            <div className="full-stats-header">Average time (15x):</div>
                            <div className="full-stats-count count-pct">{timeCompleteAvg15}</div>
                        </div>
                        <div className="full-stats-row row-pct">
                            <div className="full-stats-header">Average time (21x):</div>
                            <div className="full-stats-count count-pct">{timeCompleteAvg21}</div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default FullStatsPage