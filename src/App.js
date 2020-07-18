import React, { Fragment, useEffect } from 'react'
import ReactGA from 'react-ga'
import { createBrowserHistory } from 'history'
import './App.css'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import CrosswordApp from './components/CrosswordApp.jsx'
import FullCrosswordApp from './components/FullCrosswordApp.jsx'
import MiniCrosswordApp from './components/MiniCrosswordApp.jsx'
import StatsApp from './components/StatsApp.jsx'
import LeaderboardApp from './components/LeaderboardApp.jsx'
import MobileView from './components/MobileView'

ReactGA.initialize('UA-172908124-1')
const browserHistory = createBrowserHistory()
browserHistory.listen((location, action) => {
  ReactGA.pageview(location.pathname + location.search)
  console.log("The current pathname: " + location.pathname + location.search)
})

function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])

  return (
    <Fragment>
      <div className="mobile-view">
        <MobileView />
      </div>
      <div className="app-wrapper">
        <Router history={browserHistory}>
          <Switch>
            <Route exact path="/" component={CrosswordApp} />
            <Route path="/crosswords" component={FullCrosswordApp} />
            <Route path="/minis" component={MiniCrosswordApp} />
            <Route path="/stats" component={StatsApp} />
            <Route path="/leaderboard" component={LeaderboardApp} />
          </Switch>
        </Router>
      </div>
    </Fragment>
  );
}

export default App;
