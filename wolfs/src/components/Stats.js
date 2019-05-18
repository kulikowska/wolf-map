import React, { Component } from 'react';
import Chart from 'chart.js';
import Select from 'react-select';
import YearSelect from './Utility/YearSelect.js';

import { getAllYears } from '../functions.js';

const years = require('../data/year-data.json')
const packs = require('../data/wolf-report-data.json')


let allYears = getAllYears();



//reformat year data 
//console.log(years);

let newYearData = JSON.parse(JSON.stringify(years));

let yearsArr = Object.entries(newYearData);
 yearsArr.map((year, yearIdx) => {
    //console.log(year);
    let newPackFormat = {};
    //newYearData[year[0]].packs
    year[1].packs.map((pack, packIdx) => {
        newPackFormat[pack.name] = pack;
    });
    newYearData[year[0]].packs = newPackFormat;
    //console.log(newPackFormat);
 });


//console.log(newYearData, ' new format for years');

class Stats extends Component {

    constructor(props) {
        super(props);
        this.changeYear = this.changeYear.bind(this);
        this.state = {
            currentYear : '2017'
        };
    }

  componentDidMount() {

    let yearsArr = Object.entries(years);
    let labels = [];
    let data   = [];

    yearsArr.forEach(year => {
        labels.push(year[0]);
        data.push(year[1].total);
    });

    var ctx = document.getElementById('totalChart');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Wolves Per Year',
                data: data,
                borderColor : 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                lineTension: 0.2,
                pointBorderWidth: 4,
                pointHitRadius: 20,
                pointHoverBackgroundColor : 'orange'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    this.drawYearChart();
  }

    drawYearChart() {

        let yearLabels = [];
        let yearData   = [];
        let colors     = [];

        years[this.state.currentYear].packs.map(pack => {
            yearLabels.push(pack.name);
            yearData.push(pack.numbers.total);
            colors.push(pack.color);
        });

        var ctxYear = document.getElementById('yearChart');
        var yearChart = new Chart(ctxYear, {
            type: 'bar',
            data: {
                labels: yearLabels,
                datasets: [{
                    label: this.state.currentYear + ' Data',
                    data: yearData,
                    backgroundColor : colors,
                    borderColor : 'rgba(0,0,0,0.8)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        this.setState({ yearChart });
     
    }

    changeYear = (newYear) => {
        console.log(newYear);
        if (newYear) {
            this.setState({ currentYear : newYear });
            this.updateYearChart(newYear);
        }
    }
    
    updateYearChart(newYear) {
        const { yearChart } = this.state;
        console.log(yearChart);


        let currentYearPacks = [];
        let removeThesePacks = [];

        years[newYear].packs.map(pack => {
            currentYearPacks.push(pack.name);
        });

        /*
        currentYearPacks.map(pack => {
            if (yearChart.data.labels.indexOf(pack) === -1 ) {
                removeThesePacks.push(pack);
            }
        });
        */

        yearChart.data.labels.map(pack => {
            if (currentYearPacks.indexOf(pack) === -1 ) {
                removeThesePacks.push(pack);
            }
        });

        /*
        console.log(removeThesePacks, ' remove this pack');
        console.log(currentYearPacks, ' current year packs');
        console.log(yearChart.data.labels, ' previous year packs');
        */

        //Remove old packs


        currentYearPacks.map(pack => {

            let packIdx = yearChart.data.labels.indexOf(pack);
            let dataIdx;

            if (packIdx !== -1) {
                yearChart.data.datasets[0].data[packIdx] = 
                newYearData[newYear].packs[pack].numbers.total;
            } else {
                //console.log(pack);
                yearChart.data.labels.push(pack);
                yearChart.data.datasets[0].data.push(
                    newYearData[newYear].packs[pack].numbers.total
                );
                yearChart.data.datasets[0].backgroundColor.push(
                    newYearData[newYear].packs[pack].color
                );
            }
        });

        removeThesePacks.map(pack => {
           let packIdx = yearChart.data.labels.indexOf(pack); 
           //console.log(packIdx, ' pack idx');
           yearChart.data.labels.splice(packIdx, 1);
           yearChart.data.datasets[0].data.splice(packIdx, 1);
           yearChart.data.datasets[0].backgroundColor.splice(packIdx, 1);
        });


        yearChart.update();
        //this.drawYearChart();
    }


  render() {
      return (
        <div id="stats">
            <canvas id="totalChart" max-width="400" max-height="400"></canvas>
            <YearSelect 
                currentYear={this.state.currentYear}
                allYears={allYears}
                changeYear={this.changeYear}
            />
            <canvas id="yearChart" max-width="400" max-height="400"></canvas>
        </div>
      );
  }
}

export default Stats;
