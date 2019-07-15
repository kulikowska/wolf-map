import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import 'semantic-ui-css/semantic.min.css'
import './css/App.css';

import Header from './components/Header.js';
import Map from './components/Map.js';
import Stats from './components/Stats.js';
import About from './components/About.js';
import Gallery from './components/Gallery.js';
import Packs from './components/Packs.js';

class App extends Component {

constructor(props) {
    super(props);
    this.state = {
        menu : false
    }
}
  render() {
      return (
        <div className="App">
            <Router>
                <div id="header">
                    <div className="overLay">
                        <div className="title" ng-click="nav='map'"><Link to="/"> Yellowstone Wolf Map </Link></div>
                        <nav>
                            <ul className={"menu" + (this.state.menu ? ' active' : '')}>
                                <li>
                                    <Link to="/about/"> About</Link>
                                </li>
                                <li>
                                    <Link to="/map"> Map</Link>
                                </li>
                                <li>
                                    <Link to="/statistics/"> Statistics </Link>
                                </li>
                                <li>
                                    <Link to="/gallery/"> Gallery </Link>
                                </li>
                                <li>
                                    <Link to="/resources/"> Resources</Link>
                                </li>
                            </ul>

                            <div    
                                className={"burger" + (this.state.menu ? ' active' : '')}
                                onClick={() => this.setState({ menu : !this.state.menu })}
                            > 
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </nav>
                    </div>
                </div>

                <Route path={["/", "/map", "/map/:id" ]} exact component={Map} />
                <Route path="/statistics/" component={Stats} />
                <Route path="/about/" component={About} />
                <Route path="/gallery/" component={Gallery} />
                <Route exact path="/map/:id" component={Packs} />
            </Router>
        </div>
      );
  }
}

export default App;
