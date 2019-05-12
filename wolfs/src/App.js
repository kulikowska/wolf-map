import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './css/App.css';

import Header from './components/Header.js';
import Map from './components/Map.js';
import Stats from './components/Stats.js';
import About from './components/About.js';

function App() {
  return (
    <div className="App">
        <Router>
            <div id="header">
                <div className="overLay">
                    <div className="title" ng-click="nav='map'"> Yellowstone Wolf Map</div>
                    <nav>
                        <ul className="menu">
                            <li>
                                <Link to="/"> Map</Link>
                            </li>
                            <li>
                                <Link to="/statistics/"> Statistics </Link>
                            </li>
                            <li>
                                <Link to="/about/"> About</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <Route path="/" exact component={Map} />
            <Route path="/statistics/" component={Stats} />
            <Route path="/about/" component={About} />
        </Router>
    </div>
  );
}

export default App;
