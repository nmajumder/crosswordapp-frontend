import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareDown, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons'
import '../css/LeaderboardApp.css'
import api from '../libs/api.js'
import UserValidation from '../libs/UserValidation'
import User from '../libs/User'
import CrosswordNavBar from './CrosswordNavBar'
import LeaderboardChart from './LeaderboardChart'
import Footer from './Footer'

class LeaderboardApp extends Component {
    constructor (props) {
        super(props)

        this.statTitles = ["Most Completed Puzzles", "Fastest Solve Time", "Highest Completion Percentage", 
                                "Lowest Reveal Percentage", "Activity Streak"]
        this.axisTitles = [
            ["Total Completed", "Games"],
            ["Best Time", "Minutes"], 
            ["Completion Percentage", "Percent"],
            ["Reveal Percentage", "Percent"],
            ["Activity Streak", "Days"],
        ]

        this.chartInfos = [
            "Most total completed minis overall.",
            "Fastest completion time by grid size, excluding those with the check or reveal feature used.",
            "Highest completion percentage of generated minis.",
            "Lowest reveal percentage of completed minis (for those with 1 or more completed puzzles).",
            "Most consecutive days completing at least 1 mini puzzle."
        ]

        this.state = {
            leaderboard: null,
            selectedStat: 0,
            selectedSize: 5,
            sizeDropdownOpen: false,
            selectedStreak: "Current",
            streakDropdownOpen: false
        }

        this.getLeaderboard = this.getLeaderboard.bind(this)
        this.statOptionClicked = this.statOptionClicked.bind(this)
        this.toggleDropdownVisibility = this.toggleDropdownVisibility.bind(this)
        this.solveTimeSizeClicked = this.solveTimeSizeClicked.bind(this)
        this.streakTypeClicked = this.streakTypeClicked.bind(this)
    }

    async componentDidMount () {
        console.log("Validating user from leaderboard page")
        let user = await UserValidation.validateUser()
        let validated = user !== null && user.token !== null && user.email !== null && user.username !== null

        if (!validated) {
            this.props.history.push('/')
        } else {
            this.getLeaderboard()
        }
    }

    async getLeaderboard () {
        let response
        let requestSuccess
        try {
            response = await api.getLeaderboard(User.token)
            requestSuccess = true
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Failed to retrieve leaderboard")
        } else {
            this.setState({
                leaderboard: response.data
            })
        }
    }

    statOptionClicked (opt) {
        this.setState({
            selectedStat: opt
        })
    }

    solveTimeSizeClicked (size) {
        this.setState({
            selectedSize: size
        })
    }

    streakTypeClicked (type) {
        this.setState({
            selectedStreak: type
        })
    }

    toggleDropdownVisibility (isOpen, type) {
        if (type === "SIZE") {
            this.setState({
                sizeDropdownOpen: isOpen
            })
        } else {
            this.setState({
                streakDropdownOpen: isOpen
            })
        }
    }

    render () {
        const { leaderboard, selectedStat, selectedSize, sizeDropdownOpen, selectedStreak, streakDropdownOpen } = this.state
        if (leaderboard === null) {
            return (
                <Fragment>
                    <CrosswordNavBar />
                    <div className="leaderboard-wrapper">
                        <div className="leaderboard-option-section">
                            <div className="leaderboard-option" style={{backgroundColor: "white", zIndex: "3", boxShadow: "-5px -1px 5px 0px rgb(0,0,0,.5)"}}>
                                <div className="leaderboard-option-title" style={{filter: "blur(5px)"}}>{this.statTitles[0]}</div>
                            </div>
                            <div className="leaderboard-option">
                                <div className="leaderboard-option-title" style={{filter: "blur(5px)"}}>{this.statTitles[1]}</div>
                            </div>
                            <div className="leaderboard-option">
                                <div className="leaderboard-option-title" style={{filter: "blur(5px)"}}>{this.statTitles[2]}</div>
                            </div>
                            <div className="leaderboard-option">
                                <div className="leaderboard-option-title" style={{filter: "blur(5px)"}}>{this.statTitles[3]}</div>
                            </div>
                            <div className="leaderboard-option">
                                <div className="leaderboard-option-title" style={{filter: "blur(5px)"}}>{this.statTitles[4]}</div>
                            </div>
                        </div>
                        <div className="leaderboard-stat-section">
                            <div style={{fontSize: "24pt", marginTop: "50px", textAlign: "center", fontFamily: "Arial", fontWeight: "bold", opacity: "0.7"}}>Loading Leaderboard...</div>
                        </div>
                    </div>
                </Fragment>
            )
        }

        let data
        let type
        switch(selectedStat) {
            case 0:
                data = leaderboard.mostGamesCompleted
                data.sort((a,b) => a.data > b.data ? -1 : 1)
                type = "INT"
                break
            case 1:
                let startInd = (selectedSize - 5) * 3
                let allDifficultyResults = Array.prototype.concat(
                    leaderboard.bestTimesPerCategory[startInd],
                    leaderboard.bestTimesPerCategory[startInd+1],
                    leaderboard.bestTimesPerCategory[startInd+2]
                )
                allDifficultyResults.sort((a,b) => a.data > b.data ? 1 : -1)
                data = allDifficultyResults.slice(0, 10)
                data.sort((a,b) => a.data > b.data ? 1 : -1)
                type = "TIME"
                if (data.length > 0 && data[data.length-1].data < 120) {
                    this.axisTitles[1][1] = "Seconds"
                } else {
                    this.axisTitles[1][1] = "Minutes"
                }
                break;
            case 2:
                data = leaderboard.bestCompletionPercent
                data.sort((a,b) => a.data > b.data ? -1 : 1)
                type = "PCT"
                break
            case 3: 
                data = leaderboard.lowestRevealPercent
                data.sort((a,b) => a.data > b.data ? 1 : -1)
                type = "PCT"
                break
            case 4:
                if (selectedStreak === "Current") {
                    data = leaderboard.currentStreak
                } else {
                    data = leaderboard.longestStreak
                }
                data.sort((a,b) => a.data > b.data ? -1 : 1)
                type = "INT"
                break
        }

        let selectedOptionStyle = {
            backgroundColor: "white",
            zIndex: "3"
        }
        if (selectedStat === 0) {
            selectedOptionStyle["boxShadow"] = "-5px -1px 5px 0px rgb(0,0,0,.5)"
        } else if (selectedStat === 4) {
            selectedOptionStyle["boxShadow"] = "-5px 1px 5px 0px rgb(0,0,0,.5)"
        } else {
            selectedOptionStyle["boxShadow"] = "-5px 0px 5px 0px rgb(0,0,0,.5)"
        }

        let chartTitle = this.statTitles[selectedStat]
        if (selectedStat === 1) {
            chartTitle += " (Without Help): " + selectedSize + " x " + selectedSize
        } else if (selectedStat === 4) {
            chartTitle += ": " + selectedStreak
        }

        return (
            <Fragment>
                <CrosswordNavBar />
                <div className="leaderboard-wrapper">
                    <div className="leaderboard-option-section">
                        <div className="leaderboard-option" style={selectedStat === 0 ? selectedOptionStyle : {}}
                            onClick={() => this.statOptionClicked(0)}>
                            <div className="leaderboard-option-title">{this.statTitles[0]}</div>
                        </div>
                        <div className="leaderboard-option" style={selectedStat === 1 ? selectedOptionStyle : {}}
                            onClick={() => this.statOptionClicked(1)}>
                            <div className="leaderboard-option-title">
                                {this.statTitles[1]}
                            </div>
                            <div className="leaderboard-option-dropdown-section">
                                <DropdownButton alignRight id="leaderboard-size-dropdown"
                                title={<div><span className="leaderboard-option-size">{selectedSize} x {selectedSize}</span>
                                    <FontAwesomeIcon id="leaderboard-caret-icon" icon={sizeDropdownOpen ? faCaretSquareDown : faCaretSquareRight} /></div>}
                                onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, "SIZE") }}>
                                    <div className="leaderboard-dropdown-item-section">
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.solveTimeSizeClicked(5) }}>5 x 5</Dropdown.Item>
                                        <div className="leaderboard-dropdown-item-divider"></div>
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.solveTimeSizeClicked(6) }}>6 x 6</Dropdown.Item>
                                        <div className="leaderboard-dropdown-item-divider"></div>
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.solveTimeSizeClicked(7) }}>7 x 7</Dropdown.Item>
                                        <div className="leaderboard-dropdown-item-divider"></div>
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.solveTimeSizeClicked(8) }}>8 x 8</Dropdown.Item>
                                        <div className="leaderboard-dropdown-item-divider"></div>
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.solveTimeSizeClicked(9) }}>9 x 9</Dropdown.Item>
                                    </div>
                                </DropdownButton>
                            </div>
                        </div>
                        <div className="leaderboard-option" style={selectedStat === 2 ? selectedOptionStyle : {}}
                            onClick={() => this.statOptionClicked(2)}>
                            <div className="leaderboard-option-title">{this.statTitles[2]}</div>
                        </div>
                        <div className="leaderboard-option" style={selectedStat === 3 ? selectedOptionStyle : {}}
                            onClick={() => this.statOptionClicked(3)}>
                            <div className="leaderboard-option-title">{this.statTitles[3]}</div>
                        </div>
                        <div className="leaderboard-option" style={selectedStat === 4 ? selectedOptionStyle : {}}
                            onClick={() => this.statOptionClicked(4)}>
                            <div className="leaderboard-option-title">
                                {this.statTitles[4]}
                            </div>
                            <div className="leaderboard-option-dropdown-section">
                                <DropdownButton alignRight id="leaderboard-size-dropdown"
                                title={<div><span className="leaderboard-option-size">{selectedStreak}</span>
                                    <FontAwesomeIcon id="leaderboard-caret-icon" icon={streakDropdownOpen ? faCaretSquareDown : faCaretSquareRight} /></div>}
                                onToggle={(isOpen, event, metadata) => { this.toggleDropdownVisibility(isOpen, "STREAK") }}>
                                    <div className="leaderboard-dropdown-item-section">
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.streakTypeClicked("Current") }}>Current</Dropdown.Item>
                                        <div className="leaderboard-dropdown-item-divider"></div>
                                        <Dropdown.Item className="leaderboard-dropdown-item" as="button" onClick={() => { this.streakTypeClicked("Longest") }}>Longest</Dropdown.Item>
                                    </div>
                                </DropdownButton>
                            </div>
                        </div>
                    </div>
                    <div className="leaderboard-stat-section">
                        <LeaderboardChart data={data} dataType={type} chartTitle={chartTitle} 
                            axisLabel={this.axisTitles[selectedStat]} chartInfo={this.chartInfos[selectedStat]} />
                    </div>
                </div>
                <Footer />
            </Fragment>
        )
    }
}

export default LeaderboardApp