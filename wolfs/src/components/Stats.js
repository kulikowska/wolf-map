import React, { Component } from 'react';
import Chart from 'chart.js';
const years = require('../data/year-data.json')
const packs = require('../data/wolf-report-data.json')

class Stats extends Component {

  componentDidMount() {

    let yearsArr = Object.entries(years);
    let labels = [];
    let data   = [];

    yearsArr.forEach(year => {
        labels.push(year[0]);
        data.push(year[1].total);
    });

    var ctx = document.getElementById('myChart');
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
  }

  render() {
      return (
        <div id="stats">
            <canvas id="myChart" max-width="400" max-height="400"></canvas>
        </div>
      );
  }
}

export default Stats;
