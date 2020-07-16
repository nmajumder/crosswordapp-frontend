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
            selectedSize: null,
            selectedDifficulty: null
        }

        this.tableCellClicked = this.tableCellClicked.bind(this)
        this.formattedTime = this.formattedTime.bind(this)
        this.formattedPct = this.formattedPct.bind(this)
    }

    tableCellClicked (size, difficulty) {
        this.setState({
            selectedSize: size,
            selectedDifficulty: difficulty
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
        const { selectedSize, selectedDifficulty } = this.state

        const stats = MiniStatsService.getLoadedMiniStats()
        if (stats === null || stats === undefined) return null
        
        let difficulties = [["Standard", "#109618"], ["Difficult", "#d49b00"], ["Expert", "#dc3912"]]
        let lineShadeColor = "#F0F0F0"

        let categoryHeader = ""
        let categoryHeaderColor = "black"
        if (selectedSize !== null) {
            if (selectedDifficulty === null) {
                categoryHeader = selectedSize + " x " + selectedSize + " Totals"
            } else {
                categoryHeaderColor = difficulties.find(diff => diff[0] === selectedDifficulty)[1]
                categoryHeader = selectedDifficulty + " " + selectedSize + " x " + selectedSize
            }
        }

        let sizeTotals = [{},{},{},{},{}]
        for (let i = 0; i < 15; i++) {
            let ind = stats.categoryStats[i].gridSize - 5
            if (sizeTotals[ind]["completedGames"] === null || sizeTotals[ind]["completedGames"] === undefined) {
                    sizeTotals[ind]["completedGames"] = 0
            }
            sizeTotals[ind]["completedGames"] += stats.categoryStats[i].completed
            if (stats.categoryStats[i].bestTime > 0 && (sizeTotals[ind]["bestTimes"] === 0 || sizeTotals[ind]["bestTimes"] === undefined
                || stats.categoryStats[i].bestTime < sizeTotals[ind]["bestTimes"])) {
                    sizeTotals[ind]["bestTimes"] = stats.categoryStats[i].bestTime
                    sizeTotals[ind]["bestDates"] = stats.categoryStats[i].bestDate
            }
            if (sizeTotals[ind]["averageTimes"] === null || sizeTotals[ind]["averageTimes"] === undefined) {
                sizeTotals[ind]["averageTimes"] = 0
            }
            sizeTotals[ind]["averageTimes"] += stats.categoryStats[i].completed * stats.categoryStats[i].averageTime
            if (sizeTotals[ind]["checkPercents"] === null || sizeTotals[ind]["checkPercents"] === undefined) {
                sizeTotals[ind]["checkPercents"] = 0
            }
            sizeTotals[ind]["checkPercents"] += stats.categoryStats[i].checked
            if (sizeTotals[ind]["revealPercents"] === null || sizeTotals[ind]["revealPercents"] === undefined) {
                sizeTotals[ind]["revealPercents"] = 0
            }
            sizeTotals[ind]["revealPercents"] += stats.categoryStats[i].revealed
        }
        for (let j = 0; j < 5; j++) {
            sizeTotals[j]["averageTimes"] = sizeTotals[j]["averageTimes"] / sizeTotals[j]["completedGames"]
            sizeTotals[j]["checkPercents"] = sizeTotals[j]["checkPercents"] / sizeTotals[j]["completedGames"]
            sizeTotals[j]["revealPercents"] = sizeTotals[j]["revealPercents"] / sizeTotals[j]["completedGames"]
        }

        return (
            <Fragment>
                <div className="mini-stats-page-wrapper">
                    <div className="mini-stats-section-header">
                        Category Stats{selectedSize === null ? "" : ":"}<span style={{color: categoryHeaderColor, fontFamily: "arial", fontWeight: "bold", display: selectedSize === null ? "none" : ""}}> {categoryHeader}</span>
                    </div>
                    <div className={selectedSize !== null ? "mini-stats-cell-detail" : "mini-stats-cell-detail-collapsed"}>
                        <FontAwesomeIcon icon={faArrowCircleLeft} className="mini-stats-uncollapse-btn" onClick={() => this.tableCellClicked(null)}/>    
                        <div className="mini-stats-category-section">
                            <MiniStatsCategoryDetail ministats={stats} size={selectedSize} difficulty={selectedDifficulty} totals={sizeTotals}/>
                        </div>
                    </div>
                    <div className={selectedSize !== null ? "mini-stats-table-collapsed" : "mini-stats-table"}>
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
                                    { [5,6,7,8,9].map((size) => stats.categoryStats.find(cat => cat.gridSize === size && cat.difficulty === diff[0])).map( (category, j) => 
                                        <div className="mini-stats-table-row-cell" style={{borderRight: j === 4 ? "none" : ""}} key={j}>
                                            <div className="mini-stats-table-row-cell-overlay" style={{display: selectedSize !== null ? "none" : ""}} onClick={() => this.tableCellClicked(category.gridSize, category.difficulty)}>Detailed View</div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 0 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Completed:</span>
                                                <span className="cell-line-body">{category.completed > 0 ? category.completed : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 1 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Best time:</span>
                                                <span className="cell-line-body">{category.bestTime > 0 ? this.formattedTime(category.bestTime/60) : category.completed > 0 ? "N/A" : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 0 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Avg time:</span>
                                                <span className="cell-line-body">{category.completed > 0 ? this.formattedTime(category.averageTime/60) : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 1 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Check used:</span>
                                                <span className="cell-line-body">{category.completed > 0 ? this.formattedPct((category.checked / category.completed) * 100) : ""}</span>
                                            </div>
                                            <div className="mini-stats-table-row-cell-line" style={{backgroundColor: (i*5+j)%2 === 0 ? "white" : lineShadeColor}}>
                                                <span className="cell-line-header">Reveal used:</span>
                                                <span className="cell-line-body">{category.completed > 0 ? this.formattedPct((category.revealed / category.completed) * 100) : ""}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mini-stats-table-row totals-row">
                                <div className={`mini-stats-table-row-header`}>Totals</div>
                                { sizeTotals.map( (statDict, k) =>
                                    <div className="mini-stats-table-row-cell" style={{borderRight: k === 4 ? "none" : ""}} key={k}>
                                        <div className="mini-stats-table-row-cell-overlay overlay-totals" style={{display: selectedSize !== null ? "none" : ""}} onClick={() => this.tableCellClicked(k+5, null)}>Detailed View</div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 1 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Completed:</span>
                                            <span className="cell-line-body">{statDict["completedGames"] > 0 ? statDict["completedGames"] : ""}</span>
                                        </div>
                                        <div className="mini-stats-table-row-cell-line" style={{backgroundColor: k%2 === 0 ? "white" : lineShadeColor}}>
                                            <span className="cell-line-header">Best time:</span>
                                            <span className="cell-line-body">{statDict["bestTimes"] > 0 ? this.formattedTime(statDict["bestTimes"]/60) : statDict["completedGames"] > 0 ? "N/A" : ""}</span>
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