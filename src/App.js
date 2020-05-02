import React from 'react'
import './App.css'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import CrosswordApp from './components/CrosswordApp.jsx'
import FullCrosswordApp from './components/FullCrosswordApp.jsx'
import MiniCrosswordApp from './components/MiniCrosswordApp.jsx'

function App() {

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={CrosswordApp} />
        <Route path="/crosswords" component={FullCrosswordApp} />
        <Route path="/minis" component={MiniCrosswordApp} />
      </Switch>
    </Router>
  );
}

export default App;
