import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
class MiniStatsActivityChart extends Component {
    constructor (props) {
        super(props)

        // the 3 functions are for the following actions:
        // 1. given a date obj, return the first date in the 'group' it falls into
        // 2. given a date obj, return the first date in the NEXT 'group' (i.e. move forward 'group' amount of steps)
        // 3. given a date obj, return the string label to display in the chart depending on the 'group'
        this.groupObj = {}
        this.groupObj['Years'] = [
            function (date) {
                let newDate = new Date(date.getFullYear() + ' 06:00:00 EDT')
                return newDate
            },
            function (date) {
                let newDate = new Date(date)
                newDate.setFullYear(newDate.getFullYear + 1)
                return newDate
            },
            function (date) {
                return date.getFullYear()
            }
        ]
        this.groupObj['Months'] = [
            function (date) {
                let newDate = new Date(date.getFullYear() + ' 06:00:00 EDT')
                newDate.setMonth(date.getMonth())
                return newDate
            },
            function (date) {
                let newDate = new Date(date)
                newDate.setMonth(newDate.getMonth() + 1)
                return newDate
            },
            function (date) {
                return monthNames[date.getMonth()] + ' ' + date.getFullYear()
            }
        ]
        this.groupObj['Weeks'] = [
            function (date) {
                let dayOfWeek = date.getDay()
                let newDate = new Date(date)
                newDate.setDate(date.getDate() - dayOfWeek)
                return newDate
            },
            function (date) {
                let newDate = new Date(date)
                newDate.setDate(date.getDate() + 7)
                return newDate
            },
            function (date) {
                return 'Week of ' + monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
            }
        ]
        this.groupObj['Days'] = [
            function (date) {
                return date
            },
            function (date) {
                let newDate = new Date(date)
                newDate.setDate(newDate.getDate() + 1)
                return newDate
            },
            function (date) {
                return monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
            }
        ]
    }


    render () {
        let stats = this.props.stats
        if (stats === null || stats === undefined) return null

        let size = this.props.size
        let difficulty = this.props.difficulty

        let maxColumns = this.props.maxColumns
        if (maxColumns === null || maxColumns === undefined) {
            maxColumns = 15
        }

        let indexList = []
        for (let i = 0; i < stats.categoryStats.length; i++) {
            let category = stats.categoryStats[i]
            if (size === null || (category.gridSize === size && (difficulty === null || category.difficulty === difficulty))) {
                indexList.push(i)
            }
        }

        let dateStrList = []
        for (let i of indexList) {
            for (let dateStr in stats.categoryStats[i].activityMap) {
                if (!dateStrList.includes(dateStr)) {
                    dateStrList.push(dateStr)
                }
            }
        }
        if (dateStrList.length === 0) {
            return null;
        }
        dateStrList.sort()
        let minDate = new Date(dateStrList[0] + ' 00:00:00 EDT')

        let daySpread = Math.floor((new Date() - minDate) / (1000 * 3600 * 24))

        let group
        if (daySpread > maxColumns * 30) {
            group = 'Years'
        } else if (daySpread > maxColumns * 7) {
            group = 'Months'
        } else if (daySpread > maxColumns) {
            group = 'Weeks'
        } else {
            group = 'Days'
        }

        let groupingFunc = this.groupObj[group][0]
        let nextGroupFunc = this.groupObj[group][1]
        let labelFunc = this.groupObj[group][2]

        let dates = {}
        let dateLabels = []
        for (let dateStr of dateStrList) {
            let date = new Date(dateStr.split('-').join('/') + ' 00:00:00 EDT')
            let groupedDate = groupingFunc(date)
            let total = 0
            for (let i of indexList) {
                if (stats.categoryStats[i].activityMap[dateStr] !== undefined) {
                    total += stats.categoryStats[i].activityMap[dateStr]
                }
            }
            if (dates[groupedDate] === null || dates[groupedDate] === undefined) {
                dates[groupedDate] = total
            } else {
                dates[groupedDate] += total
            }
            dateLabels.push(labelFunc(groupedDate))
        }
        
        let groupDate = groupingFunc(minDate)
        while (groupDate <= new Date()) {
            if (!dateLabels.includes(labelFunc(groupDate))) {
                dates[groupDate] = 0
            }
            groupDate = nextGroupFunc(groupDate)
        }

        let timelineData = [["Date", "Completed"]]
        let timelineTicks = []
        for (let date in dates) {
            let dateObj = new Date(date)
            let label = labelFunc(dateObj)
            timelineData.push([{v: dateObj, f: label}, dates[date]])
            timelineTicks.push(dateObj)
        }

        let axisFormat = 'MMM dd, yyyy'
        if (group === 'Months') axisFormat = 'MMM yyyy'
        else if (group === 'Years') axisFormat = 'yyyy'

        let title = size === null ? "Total puzzles completed over time" : "Puzzles completed over time"
        let height = this.props.chartHeight === null || this.props.chartHeight === undefined ? "350px" : this.props.chartHeight
        let animationTime = size === null ? 500 : 1000

        return (
            <Chart
                chartType="ColumnChart"
                width="100%"
                height={height}
                data={timelineData} 
                options={{
                    animation: {duration: animationTime, startup: true},
                    title: title, titleTextStyle: {fontSize: '20'}, legend: {position: 'none'},
                    chartArea: {left: 50, width: '100%'},
                    vAxis: {minValue: 0},
                    hAxis: {ticks: timelineTicks, format: axisFormat, title: group, 
                        titleTextStyle: {fontSize: '18', bold: true, italic: false}}
                }} />
        )
    }
}

MiniStatsActivityChart.propTypes = {
    stats: PropTypes.object.isRequired,
    size: PropTypes.number,
    difficulty: PropTypes.string,
    chartHeight: PropTypes.number,
    maxColumns: PropTypes.number
}

export default MiniStatsActivityChart