import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import Chart from 'react-google-charts'

class MiniStatsMetricChart extends Component {
    constructor (props) {
        super(props)
    }

    render () {
        const title = this.props.title
        const yAxisTitle = this.props.yAxisTitle
        const data = this.props.data
        const labels = ["Size", "Easy", "Moderate", "Difficult"]

        return (
            <Chart
                chartType="ComboChart"
                width="100%"
                height="100%"
                data={[labels, data["5"], data["6"], data["7"], data["8"], data["9"]]} 
                options={{
                    title: title, titleTextStyle: {fontSize: '20'},
                    animation: {duration: 500, startup: true},
                    vAxis: { title: yAxisTitle, gridlines: {interval: [1]}, minValue: 0, maxValue: this.props.max,
                                titleTextStyle: {fontSize: '20', bold: true, italic: false}},
                    hAxis: { title: 'Grid size', gridlines: {interval: [1]}, textStyle: {fontSize: '20'},
                                titleTextStyle: {fontSize: '20', bold: true, italic: false}},
                    seriesType: 'bars',
                    colors: ["#109618", "#d49b00", "#dc3912"]
                }} />
        )
    }
}

MiniStatsMetricChart.propTypes = {
    title: PropTypes.string.isRequired,
    yAxisTitle: PropTypes.string,
    data: PropTypes.object.isRequired,
    max: PropTypes.number
}

export default MiniStatsMetricChart