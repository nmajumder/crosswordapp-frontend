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

        if (selectedCell !== null) console.log(stats)
        return (
            <Fragment>
                <div className="mini-stats-page-wrapper">
                    <div className="mini-stats-section-header">
                        Category Stats<span style={{color: categoryHeaderColor, display: selectedCell === null ? "none" : ""}}> ({categoryHeader})</span>
                    </div>
                    <div className={selectedCell !== null ? "mini-stats-cell-detail" : "mini-stats-cell-detail-collapsed"}>
                        <FontAwesomeIcon icon={faArrowCircleLeft} className="mini-stats-uncollapse-btn" onClick={() => this.tableCellClicked(null)}/>    
                        <div className="mini-stats-category-section">
                            <MiniStatsCategoryDetail index={selectedCell} ministats={stats} />
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
                                        <div className="mini-stats-table-row-cell" key={j}>
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
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default MiniStatsCategoryPage