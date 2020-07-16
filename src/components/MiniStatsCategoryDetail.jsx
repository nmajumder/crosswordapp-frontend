import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'
import MiniStatsActivityChart from './MiniStatsActivityChart'

class MiniStatsCategoryDetail extends Component {
    constructor (props) {
        super(props)

        this.formatTime = this.formatTime.bind(this)
    }

    formatTime (seconds) {
        let h = Math.floor(seconds / 3600)
        seconds -= h * 3600
        let m = Math.floor(seconds / 60)
        seconds -= m * 60
        let s = Math.round(seconds)
        if (h === 0 && m === 0) return s + " seconds"
        else if (h === 0) return m + "m " + s + "s"
        else return h + "h " + m + "m " + s + "s"
    }

    render () {
        if (this.props.size === null || this.props.size == undefined || 
            this.props.ministats === null || this.props.ministats === undefined) {
            return null
        }

        const stats = this.props.ministats
        const size = this.props.size
        const difficulty = this.props.difficulty
        const totals = this.props.totals

        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let bestDate
        let bestTime
        let averageTime
        let noData = false
        let noBestTime = false
        if (difficulty !== null) {
            let category = stats.categoryStats.find(cat => cat.gridSize === size && cat.difficulty === difficulty)
            if (category.completed === null || category.completed <= 0) {
                noData = true
            } else if (category.bestTime > 0) {
                bestDate = new Date(category.bestDate.split('-').join('/') + ' 00:00:00 EDT')
                bestTime = category.bestTime
                averageTime = category.averageTime
            } else {
                noBestTime = true
                averageTime = category.averageTime
            }
        } else {
            if (totals[size-5]["completedGames"] === null || totals[size-5]["completedGames"] <= 0) {
                noData = true
            } else if (totals[size-5]["bestTimes"] > 0) {
                bestDate = new Date(totals[size-5]["bestDates"].split('-').join('/') + ' 00:00:00 EDT')
                bestTime = totals[size-5]["bestTimes"]
                averageTime = totals[size-5]["averageTimes"]
            } else {
                noBestTime = true
                averageTime = totals[size-5]["averageTimes"]
            }
        }

        if (noData) {
            return (
                <Fragment>
                    <div style={{width: '100%', height: '100%', marginTop: '150px', textAlign: 'center', fontSize: '18pt'}}>
                        You have no games completed in this category yet. Go to the minis tab to get started!
                    </div>
                </Fragment>
            )
        }

        let bestDateStr
        if (!noBestTime) {
            bestDateStr = months[bestDate.getMonth()] + ' ' + bestDate.getDate() + ', ' + bestDate.getFullYear()
        } else {
            bestTime = 0
            bestDateStr = "N/A"
        }
        let timeScale = "Minutes"
        if (Math.max(bestTime, averageTime) < 120) {
            timeScale = "Seconds"
        }

        let finishTimeData = [['','',{role: 'style'}, {role: 'annotation'}]]
        finishTimeData.push(["Best (Without Help)", {v: timeScale === "Minutes" ? bestTime/60 : bestTime, f: this.formatTime(bestTime)}, 
            'color: #ffc600', bestDateStr])
        finishTimeData.push(["Average", {v: timeScale === "Minutes" ? averageTime/60 : averageTime, f: this.formatTime(averageTime)}, 
            'color: #a7d8ff', ''])

        let screenWid = window.innerWidth
        let maxCols = 7
        maxCols += Math.min(Math.round((screenWid - 1000) / (800 / maxCols)), 15)

        return (
            <Fragment>
                <div style={{width: '40%', display: 'inline-block'}}>
                    <Chart
                        chartType="ColumnChart"
                        width="100%"
                        height="350px"
                        data={finishTimeData}
                        options={{
                            animation: {duration: 1000, startup: true},
                            title: "Completion times", titleTextStyle: {fontSize: '20'},
                            vAxis: {title: timeScale, minValue: 0, titleTextStyle: {fontSize: '18', bold: true, italic: false}},
                            hAxis: {textStyle: {fontSize: '15', bold: true}},
                            annotations: {textStyle: {bold: true}}, legend: {position: 'none'}
                        }} />
                </div>
                <div style={{width: '60%', display: 'inline-block'}}>
                    <MiniStatsActivityChart stats={stats} size={size} difficulty={difficulty} maxColumns={maxCols}/>
                </div>
            </Fragment>
        )
    }
}

MiniStatsCategoryDetail.propTypes = {
    ministats: PropTypes.object.isRequired,
    size: PropTypes.number,
    difficulty: PropTypes.string,
    totals: PropTypes.array
}

export default MiniStatsCategoryDetail