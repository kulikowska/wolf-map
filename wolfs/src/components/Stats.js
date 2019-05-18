import React, { Component } from 'react';
import Chart from 'chart.js';
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
            currentYear : '2017',
            selectedPacks : ['Mollies', 'Bechler',  'Druid', 'Lamar Canyon' ],
            activePacks : [],
            inactivePacks : [],
            chooseMorePacks : false
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
            legend : {
                display : false
            },
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
    this.drawPackChart();

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
                legend : {
                    display : false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 40,
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        this.setState({ yearChart });
     
    }

    drawPackChart(newPacks) {
        let selectedPacks = newPacks ? newPacks : this.state.selectedPacks;

        let packLabels = [];
        let packData   = [];
        let colors     = [];

        let activePacks = [];

        selectedPacks.map(pack => {
            let thisPack = packs.packs.find( byName => byName.name === pack );
            //console.log(thisPack);

            let dataSet = {
                data : [],
                label : thisPack.name,
                borderColor : thisPack.color,
                fill : false
            }

            activePacks.push({ name : thisPack.name, color : thisPack.color });

            JSON.parse(JSON.stringify(allYears)).reverse().map(year => {
                if (thisPack.years[year]) {
                   dataSet.data.push(thisPack.years[year].numbers.adults);
                } else {
                    dataSet.data.push(null);
                }
            });
            packData.push(dataSet);
        });

        let inactivePacks = packs.packs.filter( pack => selectedPacks.indexOf(pack.name) === -1);

        //console.log(packs);
        //console.log(inactivePacks, ' inactive packs');


        this.setState({ activePacks, inactivePacks });

        //console.log(packData, ' packData');

        /*
        let packData = [
        {fillColor: "rgba(220,220,220,0.2)",
           strokeColor: "rgba(220,220,220,1)",
           data: [null, null, 65, 59, 80, 81, 56, 55, 40],
           label : 'Wapati',
           fill : false
          },
          {fillColor: "rgba(151,187,205,0.2)",
           strokeColor: "rgba(151,187,205,1)",
           data: [28, 48, 40, 19, 86, 27, 90],
           label : 'Mollies',
           fill : false
          }
        ]
        */
        /*
        packs[this.state.currentYear].packs.map(pack => {
            packLabels.push(pack.name);
            packData.push(pack.numbers.total);
            colors.push(pack.color);
        });
        */

        var ctxYear = document.getElementById('packChart');
        var packChart = new Chart(ctxYear, {
            type: 'line',
            data: {
                labels: JSON.parse(JSON.stringify(allYears)).reverse(),
                datasets : packData,
                /*
                datasets: [{
                    data: packData,
                    backgroundColor : colors,
                    borderColor : 'rgba(0,0,0,0.8)',
                    borderWidth: 1
                }]
                */
            },
            options: {
                legend : {
                    display : false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        //this.setState({ packChart });
    }

    changeYear = (newYear) => {
        //console.log(newYear);
        if (newYear) {
            this.setState({ currentYear : newYear });
            this.updateYearChart(newYear);
        }
    }
    
    updateYearChart(newYear) {
        const { yearChart } = this.state;
        //console.log(yearChart);


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

    togglePack(pack) {
        let { selectedPacks } = this.state;
        let newPacks = JSON.parse(JSON.stringify(selectedPacks));

        if (selectedPacks.indexOf(pack) === -1) {
            newPacks.push(pack);            
        } else {
            newPacks.splice(selectedPacks.indexOf(pack), 1);
        }
        this.setState({ selectedPacks : newPacks });
        this.drawPackChart(newPacks);
    }


  render() {
      return (
        <div id="stats">
            <section>
                <h1> Total Wolves Per Year </h1>
                <canvas id="totalChart" max-width="400" max-height="400"></canvas>
            </section>

            <section>
                <h1> Pack Populations 
                    <YearSelect 
                        currentYear={this.state.currentYear}
                        allYears={allYears}
                        changeYear={this.changeYear}
                    />
                </h1>
                <canvas id="yearChart" max-width="400" max-height="400"></canvas>
            </section>

            <section>
                <h1> Packs
                </h1>
                <div className="pack-labels">
                   { this.state.activePacks.map(pack => {
                       return (
                           <label 
                             style={{ color : pack.color, borderColor : pack.color }}
                             onClick={() => this.togglePack(pack.name)}
                           > 
                             {pack.name} 
                           </label>
                       )
                   })}
                </div>

                <div className="pack-labels inactive">
                    <h2> 
                        <button onClick={() => this.setState({ chooseMorePacks : !this.state.chooseMorePacks })}>
                           { this.state.chooseMorePacks ? 
                             "Hide Packs"
                           :
                             "Choose More Packs!"
                           }
                        </button> 
                    </h2>
                    <div className={"inactive-packs" + (this.state.chooseMorePacks ? " open" : "")}>
                       { this.state.inactivePacks.map(pack => {
                           return (
                               <label 
                                 style={{ color : pack.color, borderColor : pack.color }}
                                 onClick={() => this.togglePack(pack.name)}
                               > 
                                 {pack.name} 
                               </label>
                           )
                       })}
                   </div>
                </div>

                <canvas id="packChart" max-width="400" max-height="400"></canvas>
            </section>
        </div>
      );
  }
}

export default Stats;
