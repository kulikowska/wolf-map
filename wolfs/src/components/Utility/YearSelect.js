import React, { Component } from 'react';
import Select from 'react-select';

class YearSelect extends Component {

  getNewYear = (year, fromButton) => {
    //console.log(year, fromButton, this.props.allYears);

    let { allYears, changeYear} = this.props;
    let newYear = year.value ? year.value.toString() : year.toString();

    if (fromButton === 'back' || fromButton === 'forwards') {
        if ( fromButton === 'back') {
            newYear = allYears[allYears.indexOf(year) + 1];
        } else {
            newYear = allYears[allYears.indexOf(year) - 1];
        }
    }

    changeYear(newYear);
  }

  render() {
    const { allYears, currentYear } = this.props;
    //console.log(this.props);

    let selectOpts = [];
    allYears.map(year => {
        selectOpts.push({ value : year, label : year });
    });
    let formattedCurrentYear = { value : currentYear, label : currentYear }

      return (
        <div id="year-select">
            <div className="years-control-wrap">
                <button className="year-toggle backwards" onClick={() => this.getNewYear(currentYear, 'back')}> 
                    <i className="fas fa-angle-left"></i>
                </button>
                <Select 
                    value={formattedCurrentYear}
                    options={selectOpts}
                    className="years-select"
                    onChange={this.getNewYear}
                    isSearchable={false}
                />
                <button className="year-toggle forwards" onClick={() => this.getNewYear(currentYear, 'forwards')}> 
                    <i className="fas fa-angle-right"></i>
                </button>
            </div>

        </div>
      );
  }
}

export default YearSelect;
