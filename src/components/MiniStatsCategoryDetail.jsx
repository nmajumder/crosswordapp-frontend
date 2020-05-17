import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'
import MiniStatsActivityChart from './MiniStatsActivityChart'

class MiniStatsCategory extends Component {
    constructor (props) {
        super(props)

        this.dates = {}

        this.state = {
            timePeriod: null
        }

        this.formatTime = this.formatTime.bind(this)
    }

    componentWillReceiveProps (props) {
        const stats = props.ministats
        const index = props.index
        this.dates = {}
        let minDate = null
        for (let dateStr in stats.activityOverTime) {
            if (stats.activityOverTime[dateStr][index] !== null && stats.activityOverTime[dateStr][index] !== undefined) {
                console.log("Found non null date for index " + index)
                let date = new Date(dateStr + ' 00:00:00 EDT')
                if (minDate === null || date < minDate) {
                    minDate = date
                }
                this.dates[date] = stats.activityOverTime[dateStr][index]
            }
        }

        if (minDate === null) {
            console.log("Found no dates for this category")
            this.setState({
                timePeriod: null
            })
        }

        let daySpread = Math.floor((new Date() - minDate) / (1000 * 3600 * 24))
        console.log("Found a spread of " + daySpread + " days")

        if (daySpread > 70) {
            this.setState({
                timePeriod: 'Month'
            })
        } else if (daySpread > 14) {
            this.setState({
                timePeriod: 'Week'
            })
        } else {
            this.setState({
                timePeriod: 'Day'
            })
        }

        console.log("Done mounting")
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

        console.log("mini stats detail view rendering with index " + this.props.index)
        console.log(this.dates)

        const stats = this.props.ministats
        const index = this.props.index

        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let bestDate = new Date(stats.bestDates[index] + ' 00:00:00 EDT')
        let bestDateStr = months[bestDate.getMonth()] + ' ' + bestDate.getDate() + ', ' + bestDate.getFullYear()
        let finishTimeData = [['','',{role: 'style'}, {role: 'annotation'}]]
        finishTimeData.push(["Best", {v: stats.bestTimes[index]/60, f: this.formatTime(stats.bestTimes[index])}, 
            'color: #ffc600', bestDateStr])
        finishTimeData.push(["Average", {v: stats.averageTimes[index]/60, f: this.formatTime(stats.averageTimes[index])}, 
            'color: #a7d8ff', ''])

        let screenWid = window.innerWidth
        let maxCols = 7
        maxCols += Math.min(Math.round((screenWid - 1000) / (800 / maxCols)), 15)

        if (stats.completedGames[index] === null || stats.completedGames[index] <= 0) {
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
                            vAxis: {title: 'Minutes', titleTextStyle: {fontSize: '18', bold: true, italic: false}},
                            hAxis: {textStyle: {fontSize: '15'}},
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
    ministats: PropTypes.object.isRequired
}

export default MiniStatsCategory