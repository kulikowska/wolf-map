import React, { Component } from 'react';
import Chart from 'chart.js';
import Select from 'react-select';

const years = require('../data/year-data.json')
const packs = require('../data/wolf-report-data.json')

class Stats extends Component {

    constructor(props) {
        super(props);
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
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Wolves Per Year',
                data: data,
                backgroundColor : 'rgba(54, 162, 235, 0.2)',
                borderColor : 'rgba(54, 162, 235, 1)',
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

    console.log(years[this.state.currentYear]);
    let yearLabels = [];
    let yearData   = [];

    years[this.state.currentYear].packs.map(pack => {
        yearLabels.push(pack.name);
        yearData.push(pack.numbers.total);
    });

    var ctxYear = document.getElementById('yearChart');
    var yearChart = new Chart(ctxYear, {
        type: 'bar',
        data: {
            labels: yearLabels,
            datasets: [{
                label: this.state.currentYear + ' Data',
                data: yearData,
                backgroundColor : 'rgba(54, 162, 235, 0.2)',
                borderColor : 'rgba(54, 162, 235, 1)',
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
  }

  render() {
      return (
        <div id="stats">
            <canvas id="totalChart" max-width="400" max-height="400"></canvas>
            <canvas id="yearChart" max-width="400" max-height="400"></canvas>
        </div>
      );
  }
}

export default Stats;
