import Chart from 'chart.js';

export const getAllYears = () => {
    let allYears = ['95/96'];
    for (var i = 1997; i < 2018; i++) {
        allYears.push(i.toString());
    }
    return allYears.reverse();
}

export const drawChart = (domId, data, labels, type, ticks) => {
    console.log(domId);
    console.log(data);

    let chartEl = document.getElementById(domId);
    var ret = new Chart(chartEl, {
        type: type,
        data: {
            labels: labels,
            datasets : data,
        },
        options: {
            legend : {
                display : false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min : ticks ? ticks.min : 0,
                        max : ticks ? ticks.max : 200,
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    return ret;
}

export const formatYearData = (allYears, noTerritory, packs) => {
    // Bit of a disaster, but it works 
    var years = { };

    packs.packs.map(pack => {
        allYears.forEach(year => {
            if (pack.years[year]) {
                if (years[year]) {
                    years[year].packs.push( {
                        "id" : pack.id,
                        "name" : pack.name,
                        "color" : pack.color,
                        "geometry" : pack.years[year].geometry,
                        "numbers" : pack.years[year].numbers
                    })
                } else {
                    years[year] = {
                        "packs" : [],
                        //"noTerritory" : [],
                        "total" : null
                    }
                    years[year].packs.push( {
                        "id" : pack.id,
                        "name" : pack.name,
                        "color" : pack.color,
                        "geometry" : pack.years[year].geometry,
                        "numbers" : pack.years[year].numbers
                    })
                }

            }
        });
    })

    allYears.forEach(year => {
        //console.log(noTerritory.loners.years[year]);
        if (noTerritory.loners.years[year]) {
            years[year]['noTerritory'] = {
                'loners' : noTerritory.loners.years[year]
            }
        }
        if (noTerritory.captive.years[year]) {
            if (years[year]['noTerritory']) {
                years[year]['noTerritory']['captive'] = noTerritory.captive.years[year];
            } else {
                years[year]['noTerritory'] = {
                    'captive' : noTerritory.captive.years[year]
                }
            }
        }
        if (noTerritory.unknown.years[year]) {
            if (years[year]['noTerritory']) {
                years[year]['noTerritory']['unknown'] = noTerritory.unknown.years[year];
            } else {
                years[year]['noTerritory'] = {
                    'unknown' : noTerritory.unknown.years[year]
                }
            }
        }
        noTerritory.packs.map(pack => {
            for (var year in pack.years) {
                //console.log( year, 'year of pack from no territory packs');
                if (years[year]['noTerritory'] && !years[year]['noTerritory']['packs']) {
                   years[year]['noTerritory'].packs = [ ];
                } else if (!years[year]['noTerritory']){
                   years[year].noTerritory = { "packs" : []};
                }

                var data = {
                    "id" : pack.id,
                    "name" : pack.name,
                    "data" : pack.years[year].numbers
                }
            
                var exists = years[year]['noTerritory'].packs.find(function(pack) {
                    return pack.id === data.id;
                }) 

                if (!exists) {
                    years[year]['noTerritory'].packs.push( {
                        "id" : pack.id,
                        "name" : pack.name,
                        "data" : pack.years[year].numbers
                    });
                }
            }
        });
    });


    let yearsArr = Object.entries(years);

    yearsArr.map(year => {

        let yearTotal = 0;

        year[1].packs.map(pack => {
            let packTotal = 0;
            if (!isNaN(pack.numbers.adults)) {
                packTotal += pack.numbers.adults;
            }
            if (!isNaN(pack.numbers.pups)) {
                packTotal += pack.numbers.pups;
            }

            yearTotal += packTotal;

            if (isNaN(pack.numbers.pups) && isNaN(pack.numbers.adults)) {
                packTotal = "N/A";
            }


            var indexOfPack = years[year[0]].packs.findIndex(function(el) {
                return pack.id === el.id
            });
            //console.log(indexOfPack);
            years[year[0]].packs[indexOfPack].numbers.total = packTotal;
        });


       if (year[1].noTerritory && year[1].noTerritory.captive) {
         yearTotal += year[1].noTerritory.captive.numbers.total;
       }
       if (year[1].noTerritory && year[1].noTerritory.unknown) {
         yearTotal += year[1].noTerritory.unknown.numbers.total;
       }
       if (year[1].noTerritory && year[1].noTerritory.loners) {
         yearTotal += year[1].noTerritory.loners.numbers.total;
       }

        year[1].noTerritory && 
        year[1].noTerritory.packs && 
        year[1].noTerritory.packs.map(pack => {
            //console.log(year[1].noTerritory.packs);
            let packTotal = 0;
            if (!isNaN(pack.data.adults)) {
                packTotal += pack.data.adults;
            }
            if (!isNaN(pack.data.pups)) {
                packTotal += pack.data.pups;
            }

            yearTotal += packTotal;

            if (isNaN(pack.data.pups) && isNaN(pack.data.adults)) {
                packTotal = "N/A";
            }


            var indexOfPack = years[year[0]].noTerritory.packs.findIndex(function(el) {
                return pack.id === el.id
            });

            //console.log(indexOfPack);
            //console.log(years[year[0]].noTerritory.packs[indexOfPack]);
            years[year[0]].noTerritory.packs[indexOfPack].data.total = packTotal;

        });

        //console.log('year total ', yearTotal, year);
        years[year[0]].total = yearTotal;
    })

    console.log(years);
    return years;
}
