import React, { Fragment } from 'react'
import ReactGA from 'react-ga'
import createHistory from 'history/createBrowserHistory'
import './App.css'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import CrosswordApp from './components/CrosswordApp.jsx'
import FullCrosswordApp from './components/FullCrosswordApp.jsx'
import MiniCrosswordApp from './components/MiniCrosswordApp.jsx'
import StatsApp from './components/StatsApp.jsx'
import LeaderboardApp from './components/LeaderboardApp.jsx'
import MobileView from './components/MobileView'

const history = createHistory()
ReactGA.initialize('UA-172908124-1');
history.listen((location, action) => {
    ReactGA.pageview(location.pathname + location.search);
    console.log(location.pathname)
});

function App() {

  return (
    <Fragment>
      <div className="mobile-view">
        <MobileView />
      </div>
      <div className="app-wrapper">
        <Router history={history}>
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
