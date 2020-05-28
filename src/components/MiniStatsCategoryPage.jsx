import React, { Fragment, Component } from 'react'
import '../css/MiniStatsCategoryPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'
import MiniStatsService from '../libs/MiniStatsService'
import MiniStatsCategoryDetail from './MiniStatsCategoryDetail'


class MiniStatsCategoryPage extends Component {
    constructor (props) {
        super(props)

        this.titles = [["Completed puzzles","Totals"], ["Best completion times","Minutes"], ["Average completion times","Minutes"], 
                            ["Check feature usage","Percent"], ["Reveal feature usage","Percent"]]

        this.state = {
            selectedCell: null
        }

        this.tableCellClicked = this.tableCellClicked.bind(this)
        this.formattedTime = this.formattedTime.bind(this)
        this.formattedPct = this.formattedPct.bind(this)
    }

    tableCellClicked (cell) {
        this.setState({
            selectedCell: cell
        })
    }

    formattedTime (minutes) {
        let seconds = Math.round(minutes * 60)
        let h = Math.floor(seconds / 3600)
        if (h > 0) seconds -= h*3600
        let m = Math.floor(seconds / 60)
        if (m > 0) seconds -= m*60
        if (h === 0 && m === 0) return seconds + "s"
        else if (h === 0) return m + "m " + seconds + "s"
        else return h + "h " + m + "m " + seconds + "s"
    }

    formattedPct (decimal) {
        let pctVal = Math.round(decimal * 10) / 10
        return pctVal + "%"
    }

    render () {
        const { selectedCell } = this.state

        const stats = MiniStatsService.getLoadedMiniStats()
        if (stats === null || stats === undefined) return null
        
        let difficulties = [["Easy", "#109618"], ["Moderate", "#d49b00"], ["Difficult", "#dc3912"]]
        let lineShadeColor = "#F0F0F0"

        let categoryHeader = ""
        let categoryHeaderColor = "black"
        if (selectedCell !== null) {
            if (selectedCell >= 15) {
                let size = selectedCell % 5 + 5
                categoryHeader = size + " x " + size + " Totals"
            } else {
                let diff = "Easy"
                let size = selectedCell / 3 + 5
                categoryHeaderColor = difficulties[0][1]
                if (selectedCell % 3 === 1) {
                    diff = "Moderate"
                    size = (selectedCell-1) / 3 + 5
                    categoryHeaderColor = difficulties[1][1]
                } else if (selectedCell % 3 === 2) {
                    diff = "Difficult"
                    size = (selectedCell-2) / 3 + 5
                    categoryHeaderColor = difficulties[2][1]
                }
                categoryHeader = diff + " " + size + " x " + size
            }
        }

        let sizeTotals = [{},{},{},{},{}]
        for (let i = 0; i < 15; i++) {
            let ind = Math.floor(i / 3)
            if (sizeTotals[ind]["completedGames"] === null || sizeTotals[ind]["completedGames"] === undefined) {
                    sizeTotals[ind]["completedGames"] = 0
            }
            sizeTotals[ind]["completedGames"] += stats.completedGames[i]
            if (stats.bestTimes[i] > 0 && (sizeTotals[ind]["bestTimes"] === 0 || sizeTotals[ind]["bestTimes"] === undefined
                || stats.bestTimes[i] < sizeTotals[ind]["bestTimes"])) {
                    sizeTotals[ind]["bestTimes"] = stats.bestTimes[i]
                    sizeTotals[ind]["bestDates"] = stats.bestDates[i]
            }
            if (sizeTotals[ind]["averageTimes"] === null || sizeTotals[ind]["averageTimes"] === undefined) {
                sizeTotals[ind]["averageTimes"] = 0
            }
            sizeTotals[ind]["averageTimes"] += stats.completedGames[i] * stats.averageTimes[i]
            if (sizeTotals[ind]["checkPercents"] === null || sizeTotals[ind]["checkPercents"] === undefined) {
                sizeTotals[ind]["checkPercents"] = 0
            }
            sizeTotals[ind]["checkPercents"] += stats.completedGames[i] * stats.checkPercents[i]
            if (sizeTotals[ind]["revealPercents"] === null || sizeTotals[ind]["revealPercents"] === undefined) {
                sizeTotals[ind]["revealPercents"] = 0
            }
            sizeTotals[ind]["revealPercents"] += stats.completedGames[i] * stats.revealPercents[i]
        }
        for (let j = 0; j < 5; j++) {
            sizeTotals[j]["averageTimes"] = sizeTotals[j]["averageTimes"] / sizeTotals[j]["completedGames"]
            sizeTotals[j]["checkPercents"] = sizeTotals[j]["checkPercents"] / sizeTotals[j]["completedGames"]
            sizeTotals[j]["revealPercents"] = sizeTotals[j]["revealPercents"] / sizeTotals[j]["completedGames"]
        }

        console.log(sizeTotals)
        return (
            <Fragment>
                <div className="mini-stats-page-wrapper">
                    <div className="mini-stats-section-header">
                        Category Stats{selectedCell === null ? "" : ":"}<span style={{color: categoryHeaderColor, fontFamily: "arial", fontWeight: "bold", display: selectedCell === null ? "none" : ""}}> {categoryHeader}</span>
                    </div>
                    <div className={selectedCell !== null ? "mini-stats-cell-detail" : "mini-stats-cell-detail-collapsed"}>
                        <FontAwesomeIcon icon={faArrowCircleLeft} className="mini-stats-uncollapse-btn" onClick={() => this.tableCellClicked(null)}/>    
                        <div className="mini-stats-category-section">
                            <MiniStatsCategoryDetail index={selectedCell} ministats={stats} totals={sizeTotals}/>
                        </div>
                    </div>
                    <div className={selectedCell !== null ? "mini-stats-table-collapsed" : "mini-stats-table"}>
                        <div className="mini-stats-column-header-row">
                            <div className="mini-stats-column-header left-column-header">5 x 5</div>
                            <div className="mini-stats-column-header">6 x 6</div>
                            <div className="mini-stats-column-header">7 x 7</div>
                            <div className="mini-stats-column-header">8 x 8</div>
                            <div className="mini-stats-column-header right-column-header">9 x 9</div>
                        </div>
                        <div className="mini-stats-table-section">
                            { difficulties.map( (diff, i) =>
                                <div className="mini-stats-table-row" key={i}>
                                    <div className={`mini-stats-table-row-header row-header-${i}`} style={{color: diff[1]}}>{diff[0]}</div>
                                    { [0+i,3+i,6+i,9+i,12+i].map( (ind, j) => 
                                        <div className="mini-stats-table-row-cell" style={{borderRight: j === 4 ? "none" : ""}} key={j}>
                                            <div className="mini-stats-table-row-cell-overlay" style={{display: selectedCell !== null ? "none" : ""}} onClick={() => this.tableCellClicked(ind)}>Detailed View</div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 0 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Completed:</span>
                                                <span className="cell-line-body">{stats.completedGames[ind] > 0 ? stats.completedGames[ind] : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 1 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Best time:</span>
                                                <span className="cell-line-body">{stats.completedGames[ind] > 0 ? this.formattedTime(stats.bestTimes[ind]/60) : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 0 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Avg time:</span>
                                                <span className="cell-line-body">{stats.completedGames[ind] > 0 ? this.formattedTime(stats.averageTimes[ind]/60) : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 1 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Check used:</span>
                                                <span className="cell-line-body">{stats.completedGames[ind] > 0 ? this.formattedPct(stats.checkPercents[ind]*100) : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 0 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Reveal used:</span>
                                                <span className="cell-line-body">{stats.completedGames[ind] > 0 ? this.formattedPct(stats.revealPercents[ind]*100) : ""}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mini-stats-table-row totals-row">
                                <div className={`mini-stats-table-row-header`}>Totals</div>
                                { sizeTotals.map( (statDict, k) =>
                                    <div className="mini-stats-table-row-cell" style={{borderRight: k === 4 ? "none" : ""}} key={k}>
                                        <div className="mini-stats-table-row-cell-overlay overlay-totals" style={{display: selectedCell !== null ? "none" : ""}} onClick={() => this.tableCellClicked(15 + k)}>Detailed View</div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 1 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Completed:</span>
                                            <span className="cell-line-body">{statDict["completedGames"] > 0 ? statDict["completedGames"] : ""}</span>
                                        </div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 0 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Best time:</span>
                                            <span className="cell-line-body">{statDict["completedGames"] > 0 ? this.formattedTime(statDict["bestTimes"]/60) : ""}</span>
                                        </div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 1 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Avg time:</span>
                                            <span className="cell-line-body">{statDict["completedGames"] > 0 ? this.formattedTime(statDict["averageTimes"]/60) : ""}</span>
                                        </div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 0 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Check used:</span>
                                            <span className="cell-line-body">{statDict["completedGames"] > 0 ? this.formattedPct(statDict["checkPercents"]*100) : ""}</span>
                                        </div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 1 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Reveal used:</span>
                                            <span className="cell-line-body">{statDict["completedGames"] > 0 ? this.formattedPct(statDict["revealPercents"]*100) : ""}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default MiniStatsCategoryPage