import React, { Component } from 'react';

class Header extends Component {
  render() {
      return (
        <div id="header">
            <div className="overLay">
                <div className="title" ng-click="nav='map'"> Yellowstone Wolf Map</div>
                {/*
                <nav>
                    <ul className="menu">
                        <li>About</li>
                        <li>Statistics</li>
                        <li className="packs">
                            Packs
                            <div className="sub-list">
                                <div className="ui selection dropdown">
                                    <input type="hidden" name="year" />
                                    <i className="dropdown icon"></i>
                                    <div className="default text"> CurrentYear </div>
                                    <div className="menu">
                                        Packs here
                                    </div>
                                </div>
                                <ul>
                                    Pack list here
                                </ul>
                            </div>
                         </li>
                        <li>Years</li>
                    </ul>
                </nav>
                */}
            </div>
        </div>
      );
  }
}

export default Header;
