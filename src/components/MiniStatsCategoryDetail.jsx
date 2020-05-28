import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'
import MiniStatsActivityChart from './MiniStatsActivityChart'

class MiniStatsCategory extends Component {
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
        if (this.props.index === null || this.props.index == undefined || 
            this.props.ministats === null || this.props.ministats === undefined) {
            return null
        }

        const stats = this.props.ministats
        const index = this.props.index
        const totals = this.props.totals
        console.log(stats)
        console.log(totals)

        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let bestDate
        let bestTime
        let averageTime
        if (index < 15) {
            bestDate = new Date(stats.bestDates[index] + ' 00:00:00 EDT')
            bestTime = stats.bestTimes[index]
            averageTime = stats.averageTimes[index]
        } else {
            bestDate = new Date(totals[index % 5]["bestDates"] + ' 00:00:00 EDT')
            bestTime = totals[index%5]["bestTimes"]
            averageTime = totals[index%5]["averageTimes"]
        }
        let bestDateStr = months[bestDate.getMonth()] + ' ' + bestDate.getDate() + ', ' + bestDate.getFullYear()
        let finishTimeData = [['','',{role: 'style'}, {role: 'annotation'}]]
        finishTimeData.push(["Best", {v: bestTime/60, f: this.formatTime(bestTime)}, 
            'color: #ffc600', bestDateStr])
        finishTimeData.push(["Average", {v: averageTime/60, f: this.formatTime(averageTime)}, 
            'color: #a7d8ff', ''])

        console.log(finishTimeData)

        let screenWid = window.innerWidth
        let maxCols = 7
        maxCols += Math.min(Math.round((screenWid - 1000) / (800 / maxCols)), 15)

        let noData = (index < 15 && (stats.completedGames[index] === null || stats.completedGames[index] <= 0)) ||
                    (index >= 15 && (totals[index%5]["completedGames"] === null || totals[index%5]["completedGames"] <= 0))
        if (noData) {
            return (
                <Fragment>
                    <div style={{width: '100%', height: '100%', marginTop: '150px', textAlign: 'center', fontSize: '18pt'}}>
                        You have no games completed in this category yet. Go to the minis tab to get started!
                    </div>
                </Fragment>
            )
        }
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
                            vAxis: {title: 'Minutes', minValue: 0, titleTextStyle: {fontSize: '18', bold: true, italic: false}},
                            hAxis: {textStyle: {fontSize: '15', bold: true}},
                            annotations: {textStyle: {bold: true}}, legend: {position: 'none'}
                        }} />
                </div>
                <div style={{width: '60%', display: 'inline-block'}}>
                    <MiniStatsActivityChart activityMap={stats.activityOverTime} index={index} maxColumns={maxCols}/>
                </div>
            </Fragment>
        )
    }
}

MiniStatsCategory.propTypes = {
    index: PropTypes.number,
    ministats: PropTypes.object.isRequired,
    totals: PropTypes.array
}

export default MiniStatsCategory