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
                chartMax = Math.max(...stats.completedGames)
                chartData = stats.completedGames
                formatFunc = (x) => x
                break
            case 1: 
                chartMax = Math.ceil(Math.max(...stats.bestTimes)/60)
                chartData = stats.bestTimes.map(x => x/60)
                formatFunc = this.formattedTime
                break
            case 2: 
                chartMax = Math.ceil(Math.max(...stats.averageTimes)/60)
                chartData = stats.averageTimes.map(x => x/60)
                formatFunc = this.formattedTime
                break
            case 3: 
                chartMax = 100
                chartData = stats.checkPercents.map(x => x*100)
                formatFunc = this.formattedPct
                break
            case 4: 
                chartMax = 100
                chartData = stats.revealPercents.map(x => x*100)
                formatFunc = this.formattedPct
                break
        }

        for (let i = 0; i < 15; i++) {
            let size = Math.floor(i / 3) + 5
            data[size].push(chartData[i] === 0 ? {v: chartMax / 50, f: 'N/A'} : {v: chartData[i], f: formatFunc(chartData[i])})
        }

        let selectedTabStyle = {
            border: "black solid 2px",
            borderRight: "white",
            backgroundColor: "#e6f4ff"
        }

        let otherTabStyle = {
            borderRight: "black solid 2px"
        }

        return (
            <Fragment>
                <div className="mini-stats-page-wrapper">
                    <div className="mini-stats-section-header">Metric Stats</div>
                    <div className="mini-stats-chart-tabs-section">
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(0)} 
                            style={selectedTab === 0 ? selectedTabStyle : otherTabStyle}>
                            Completed Games
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(1)}
                            style={selectedTab === 1 ? selectedTabStyle : otherTabStyle}>
                            Best Times
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(2)} 
                            style={selectedTab === 2 ? selectedTabStyle : otherTabStyle}>
                            Average Times
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(3)} 
                            style={selectedTab === 3 ? selectedTabStyle : otherTabStyle}>
                            Check Percent
                        </div>
                        <div className="mini-stats-chart-tab" onClick={() => this.tabClicked(4)} 
                            style={selectedTab === 4 ? selectedTabStyle : otherTabStyle}>
                            Reveal Percent
                        </div>
                    </div>
                    <div className="mini-stats-chart-section">
                        <MiniStatsMetricChart title={this.titles[selectedTab][0]} yAxisTitle={this.titles[selectedTab][1]} data={data} max={chartMax}/>
                    </div>
                </div>
            </Fragment>
        )
    }
}

MiniStatsMetricPage.propTypes = {

}

export default MiniStatsMetricPage