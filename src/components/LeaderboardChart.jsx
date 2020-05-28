import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

class LeaderboardChart extends Component {
    constructor (props) {
        super(props)

        this.formatData = this.formatData.bind(this)
    }

    formatData (datum, type, units) {
        if (type === "PCT") {
            let rounded = Math.round(datum * 10) / 10
            return rounded + "%"
        } else if (type === "TIME") {
            let s = Math.round(datum * 60)
            let h = Math.floor(s / 3600)
            if (h > 0) s -= h * 3600
            let m = Math.floor(s / 60)
            if (m > 0) s-= m * 60
            let timeStr = ""
            if (h > 0) timeStr += h + "h "
            if (m > 0) timeStr += m + "m "
            if (timeStr === "") timeStr = s + " seconds"
            else timeStr += s + "s"
            return timeStr
        } else {
            return Math.round(datum) + " " + units
        }
    }

    render () {
        if (this.props.data === null) return null
        let type = this.props.dataType
        let units = this.props.axisLabel[1]
        let tooltipHeader = this.props.axisLabel[0]

        let data = [["Place", units, { role: 'annotation' }, { role: 'tooltip', 'p': {'html': true} }, { role: 'style'}]]
        let place = 1
        for (let stat of this.props.data) {
            let datum = stat.data
            if (type === "PCT") datum *= 100
            else if (type === "TIME") datum /= 60
            let formattedDatum = this.formatData(datum, type, units)
            let tooltipLine1 = '<p style="padding: 2px 10px; line-height: 25px; font-family: Arial; font-size: 12pt;">'
                                + 'User: <span style="font-weight: bold;">' + stat.username + '</span><br>'
                                + 'Position: <span style="font-weight: bold;">' + place + '</span><br>'
            let tooltipLine2 =  tooltipHeader + ': <span style="font-weight: bold;">' + formattedDatum + '</span></p>'
            let tooltip = tooltipLine1 + tooltipLine2
            let datumObj = type === "PCT" && datum === 0 ? {v: .5, f: datum} : datum
            let color = place === 1 ? "#f2ca4b" : place === 2 ? "#c0c0c0" : place === 3 ? "#b5702b" : "#3366cc"
            data.push(["" + place, datumObj, stat.username, tooltip, color])
            place++
        }

        if (data.length < 11) {
            for (let i = data.length; i < 11; i++) {
                data.push(["" + place, 0, "", "", ""])
                place++
            }
        }

        return (
            <Fragment>
                <Chart
                    chartType="BarChart"
                    width="100%"
                    height="100%"
                    data={data}
                    options={{
                        tooltip: {isHtml: true},
                        animation: {duration: 500, startup: true},
                        annotations: { textStyle: {bold: true}},
                        legend: {position: 'none'},
                        chartArea: {left: '18%', width: '75%', height: '70%'},
                        title: this.props.chartTitle, titleTextStyle: {fontSize: '26'},
                        vAxis: {minValue: 0, textStyle: { bold: true, fontSize: '16' },
                            title: "Leaderboard Position", titleTextStyle: {fontSize: '18', bold: true, italic: false}},
                        hAxis: {minValue: 0, maxValue: type === "PCT" ? 100.0 : "", 
                                format: type === "INT" ? '0' : 'decimal', 
                                title: units, titleTextStyle: {fontSize: '18', bold: true, italic: false}}
                    }}
                /> 
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 100, hide: 400 }}
                    overlay={
                        <Tooltip id="leaderboard-info-tooltip">
                            {this.props.chartInfo}
                        </Tooltip>
                    }
                >
                <FontAwesomeIcon style={{position: 'absolute', top: '15px', right: '15px', fontSize: '18pt'}} icon={faInfoCircle}/> 
                </OverlayTrigger>
            </Fragment>
        )
    }

}

LeaderboardChart.propTypes = {
    data: PropTypes.array,
    dataType: PropTypes.string,
    chartTitle: PropTypes.string,
    axisLabel: PropTypes.array,
    chartInfo: PropTypes.string
}

export default LeaderboardChart