import React, { Fragment, Component } from 'react'
import MiniStatsMetricChart from './MiniStatsMetricChart.jsx'
import MiniStatsService from '../libs/MiniStatsService.js'
import '../css/MiniStatsMetricPage.css'

class MiniStatsMetricPage extends Component {
    constructor (props) {
        super(props)

        this.titles = [["Completed puzzles","Totals"], ["Best completion times","Minutes"], ["Average completion times","Minutes"], 
                            ["Check feature usage","Percent"], ["Reveal feature usage","Percent"]]

        this.state = {
            selectedTab: 0
        }

        this.tabClicked = this.tabClicked.bind(this)
        this.formattedTime = this.formattedTime.bind(this)
        this.formattedPct = this.formattedPct.bind(this)
    }

    tabClicked (tab) {
        this.setState({
            selectedTab: tab
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
        const { selectedTab } = this.state

        const stats = MiniStatsService.getLoadedMiniStats()
        if (stats === null || stats === undefined) return null

        let chartWid = window.innerWidth - 300

        let data = { 5: ["5x"], 6: ["6x"], 7: ["7x"], 8: ["8x"], 9: ["9x"] }

        let chartMax
        let chartData
        let formatFunc
        switch(selectedTab) {
            case 0: 
                chartData = stats.categoryStats.map(cat => cat.completed)
                chartMax = Math.max(...chartData)
                formatFunc = (x) => x
                break
            case 1: 
                chartData = stats.categoryStats.map(cat => cat.bestTime / 60)
                chartMax = Math.ceil(Math.max(...chartData))
                formatFunc = this.formattedTime
                break
            case 2: 
                chartData = stats.categoryStats.map(cat => cat.averageTime / 60)
                chartMax = Math.ceil(Math.max(...chartData))
                formatFunc = this.formattedTime
                break
            case 3: 
                chartData = stats.categoryStats.map(cat => (cat.checked / cat.completed) * 100)
                chartMax = 100
                formatFunc = this.formattedPct
                break
            case 4: 
                chartData = stats.categoryStats.map(cat => (cat.revealed / cat.completed) * 100)
                chartMax = 100
                formatFunc = this.formattedPct
                break
        }

        for (let size = 5; size <= 9; size++) {
            for (let diff of ["Standard","Difficult","Expert"]) {
                let i = stats.categoryStats.findIndex(cat => cat.gridSize === size && cat.difficulty === diff)
                data[size].push(chartData[i] <= 0 ? 
                    {v: chartMax / 50, f: selectedTab === 1 || selectedTab === 2 ? 'N/A' : formatFunc(chartData[i])} : 
                    {v: chartData[i], f: formatFunc(chartData[i])})
            }
        }

        let selectedTabStyle = {
            backgroundColor: "white",
            zIndex: "10"
        }
        if (selectedTab === 0) {
            selectedTabStyle["boxShadow"] = "-5px -1px 5px 0px rgb(0,0,0,.5)"
        } else if (selectedTab === 4) {
            selectedTabStyle["boxShadow"] = "-5px 1px 5px 0px rgb(0,0,0,.5)"
        } else {
            selectedTabStyle["boxShadow"] = "-5px 0px 5px 0px rgb(0,0,0,.5)"
        }

        let chartTitle = this.titles[selectedTab][0]
        if (selectedTab === 1) {
            chartTitle += " (without check or reveal)"
        }

        return (
            <Fragment>
                <div className="mini-stats-page-wrapper">
                    <div className="mini-stats-section-header">Metric Stats</div>
                    <div className="mini-stats-chart-tabs-section">
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(0)} 
                            style={selectedTab === 0 ? selectedTabStyle : {}}>
                            Completed Puzzles
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(1)}
                            style={selectedTab === 1 ? selectedTabStyle : {}}>
                            Best Times
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(2)} 
                            style={selectedTab === 2 ? selectedTabStyle : {}}>
                            Average Times
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(3)} 
                            style={selectedTab === 3 ? selectedTabStyle : {}}>
                            Check Percent
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(4)} 
                            style={selectedTab === 4 ? selectedTabStyle : {}}>
                            Reveal Percent
                        </div>
                    </div>
                    <div className="mini-stats-chart-section">
                        <MiniStatsMetricChart title={chartTitle} yAxisTitle={this.titles[selectedTab][1]} data={data} max={chartMax}/>
                    </div>
                </div>
            </Fragment>
        )
    }
}

MiniStatsMetricPage.propTypes = {

}

export default MiniStatsMetricPage