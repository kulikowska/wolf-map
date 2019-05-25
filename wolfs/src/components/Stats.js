import React, { Component } from 'react';
import Chart from 'chart.js';
import YearSelect from './Utility/YearSelect.js';

import { getAllYears, drawChart } from '../functions.js';

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
    this.drawTotalChart();
    this.drawYearChart();
    this.drawPackChart();
  }

  drawTotalChart() {
    console.log(years);
    let yearsArr = Object.entries(years);
    let labels = [];
    let data   = [];

    yearsArr.forEach(year => {
        labels.push(year[0]);
        data.push(year[1].total);
    });

    let dataSet = [{
        data: data,
        borderColor : 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        lineTension: 0.2,
        pointBorderWidth: 4,
        pointHitRadius: 20,
        pointHoverBackgroundColor : 'orange'
    }]

    //const totalChartLabels = JSON.parse(JSON.stringify(allYears)).reverse();
    drawChart('totalChart', dataSet, labels, 'line');
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

        const dataSets = [{
            label: this.state.currentYear + ' Data',
            data: yearData,
            backgroundColor : colors,
            borderColor : 'rgba(0,0,0,0.8)',
            borderWidth: 1
        }]

        const yearChart = drawChart('yearChart', dataSets, yearLabels, 'bar', { min : 0, max : 40 });
        this.setState({ yearChart });
    }

    drawPackChart() {
        const { selectedPacks } = this.state;

        let packLabels = [];
        let packData   = [];

        selectedPacks.map(pack => {
            let thisPack = packs.packs.find( byName => byName.name === pack );
            let dataSet = {
                data : [],
                label : thisPack.name,
                borderColor : thisPack.color,
                fill : false
            }

            JSON.parse(JSON.stringify(allYears)).reverse().map(year => {
                if (thisPack.years[year]) {
                   dataSet.data.push(thisPack.years[year].numbers.adults);
                } else {
                    dataSet.data.push(null);
                }
            });
            packData.push(dataSet);
        });

        let activePacks = packs.packs.filter( pack => selectedPacks.indexOf(pack.name) !== -1);
        let inactivePacks = packs.packs.filter( pack => selectedPacks.indexOf(pack.name) === -1);
        this.setState({ activePacks, inactivePacks });


        const packChartLabels = JSON.parse(JSON.stringify(allYears)).reverse();
        const packChart = drawChart('packChart', packData, packChartLabels, 'line', { min : 0, max : 40 });
        this.setState({ packChart });
    }

    changeYear = (newYear) => {
        if (newYear) {
            this.setState({ currentYear : newYear });
            this.updateYearChart(newYear);
        }
    }
    
    updateYearChart(newYear) {
        const { yearChart } = this.state;
        const chartData = yearChart.data.datasets[0];
        const chartLabels = yearChart.data.labels;

        let currentYearPacks = [];
        let removeThesePacks = [];

        years[newYear].packs.map(pack => {
            currentYearPacks.push(pack.name);
        });

        chartLabels.map(pack => {
            if (currentYearPacks.indexOf(pack) === -1 ) {
                removeThesePacks.push(pack);
            }
        });

        currentYearPacks.map(pack => {
            const thisPack = newYearData[newYear].packs[pack];  
            let packIdx = chartLabels.indexOf(pack);

            if (packIdx !== -1) {
                chartData.data[packIdx] = thisPack.numbers.total;
            } else {
                chartLabels.push(pack);
                chartData.data.push(thisPack.numbers.total);
                chartData.backgroundColor.push(thisPack.color);
            }
        });

        //Remove old packs
        removeThesePacks.map(pack => {
           let packIdx = yearChart.data.labels.indexOf(pack); 
           //console.log(packIdx, ' pack idx');
           chartLabels.splice(packIdx, 1);
           chartData.data.splice(packIdx, 1);
           chartData.backgroundColor.splice(packIdx, 1);
        });

        yearChart.update();
    }

    togglePack(pack) {
        let { selectedPacks } = this.state;
        let newPacks = JSON.parse(JSON.stringify(selectedPacks));

        let addOrRemove;

        if (selectedPacks.indexOf(pack) === -1) {
            newPacks.push(pack);            
            addOrRemove = 'add';
        } else {
            newPacks.splice(selectedPacks.indexOf(pack), 1);
            addOrRemove = 'remove';
        }
        this.setState({ selectedPacks : newPacks });
        this.updatePackChart(newPacks, pack, addOrRemove);
    }

    updatePackChart(newPacks, pack, addOrRemove) {
        let { packChart, selectedPacks, activePacks, inactivePacks } = this.state;

        if (addOrRemove === 'add') {
            let thisPack = packs.packs.find( byName => byName.name === pack );
            let dataSet = {
                data : [],
                label : thisPack.name,
                borderColor : thisPack.color,
                fill : false
            }

            JSON.parse(JSON.stringify(allYears)).reverse().map(year => {
                if (thisPack.years[year]) {
                   dataSet.data.push(thisPack.years[year].numbers.adults);
                } else {
                    dataSet.data.push(null);
                }
            });
            packChart.data.datasets.push(dataSet);
        } else {
            const arrEl = packChart.data.datasets.find( packData => packData.label === pack );
            const elIdx = packChart.data.datasets.indexOf(arrEl);
            
            packChart.data.datasets.splice(elIdx, 1);
            selectedPacks.splice( (selectedPacks.indexOf(pack)), 1);
        }

        inactivePacks = packs.packs.filter( pack => newPacks.indexOf(pack.name) === -1);
        activePacks   = packs.packs.filter( pack => newPacks.indexOf(pack.name) !== -1);

        this.setState({ inactivePacks, activePacks });
        packChart.update();
    }


  render() {
      const { inactivePacks, activePacks } = this.state;
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
                             onClick={() => this.togglePack(pack.name)}
                           > 
                             <span style={{ background : pack.color }}></span>
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
                                 onClick={() => this.togglePack(pack.name)}
                               > 
                                 <span style={{ background : pack.color }}></span>
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
