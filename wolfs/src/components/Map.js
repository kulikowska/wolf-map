import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import '../css/mapbox.css';

const packs = require('../data/wolf-report-data.json')
const years = require('../data/year-data.json')
const noTerritory = require('../data/no-territory.json')
const styles = require('../styles.json')


let activePacks = [];
let legendData;

console.log('packs', packs);
console.log(noTerritory, ' no territory');

var allYears = ['95/96'];
for (var i = 1997; i < 2017; i++) {
    allYears.push(i.toString());
}


console.log('years', years);


var labels = {
   "type" : "FeatureCollection",
   "features" : []
}
var polyFeatures = {
      "type" : "FeatureCollection",
      "features" : []
};


class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentYear : '2016',
            map : false,
            popup: false,
            allYears : allYears.reverse(),
            legendData : [],
            zoomOnYearChange : true
        };
    }

    componentDidMount() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoia3VsaWtvd3NrYSIsImEiOiJjamRtY2l6dHAwbG9mMnhtdGp6eWY0a283In0.6OYpoUZAkRskJcXej314lg';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/kulikowska/cjiv4b6b08cjh2qpbvbo1xo2o',
            zoom: 7.75,
            center: [-110.5885, 44.5580]
        });
        var popup = new mapboxgl.Popup();
        this.setState({ map, popup });

        map.on('load', () => {
            this.getYearData('2016');
        });
    }

    getYearData(year) {

        const { map, popup } = this.state;
        const yearData = years[year];

        let geojson;
        let lastYearPacks   = JSON.parse(JSON.stringify(activePacks));
        labels.features = [];
        legendData      = { 'packs' : [], 'noTerritory' : yearData.other, 'total' : yearData.total };
        activePacks     = [];

        yearData.packs.forEach(pack => {
            //let data = yearData.packs[pack];

            activePacks.push(pack.id);

            // create an array of packs layers to be removed from map
            const idx = lastYearPacks.indexOf(pack.id);
            if (idx !== -1) {
                lastYearPacks.splice(idx, 1); 
            }

            geojson = {
              "type" : "FeatureCollection",
              "features" : [{
                  "type" : "Feature",
                  "properties" : { 
                       "name"   : pack.name,
                       "id"     : pack.id,
                       "adults" : pack.numbers.adults,
                       "pups"   : pack.numbers.pups,
                       "total"  : pack.numbers.total
                   },
                  "geometry" : pack.geometry
              }]
            }

            legendData.packs.push({ 'id' : pack.id, 'name' : pack.name, 'data' : pack.numbers});

            //console.log(legendData);


            // Add each layer to array of all polygons to later find bounds
            polyFeatures.features.push(geojson.features[0]);

            // Find center of polygon, create popup and label based on coords
            let newCentroid = centroid(geojson)
            newCentroid.properties.pack = pack.name;
            labels.features.push(newCentroid);

            map.on('mouseenter', pack.id, function(e) {
               var props = e.features[0].properties;

               popup.setLngLat([newCentroid.geometry.coordinates[0], newCentroid.geometry.coordinates[1]])
               .setHTML(
                       '<div class="popUp">' + 
                           '<div class="popHeader ' + e.features[0].layer.id + '"> ' + props.name + '</div>' +
                           '<div>Adults: ' + (typeof props.adults !== 'undefined' ? props.adults : 'N/A') + '</div>' +
                           '<div>Pups: ' + (typeof props.pups !== 'undefined' ? props.pups : 'N/A') + '</div>' +
                           '<div>Total: ' + (typeof props.total !== 'undefined' ? props.total : (props.pups + props.adults)) + '</div>' +
                       '</div>'
                )
               .addTo(map);
            });


            // Add territory layer to map 
            var before = map.getSource('pack-labels') ? 'pack-labels' : '';

            if (!map.getSource(pack.id)) {
                if (pack.geometry.type === "Polygon") {
                    map.addLayer({
                        "id": pack.id,
                        "type": "fill",
                        "source": {
                            "type": "geojson",
                            "data" : geojson 
                        },
                        "paint": styles.styles[pack.name] 
                    }, before);
                }
                if (pack.geometry.type === "Point") {
                    map.addLayer({
                        "id": pack.id,
                        "type": "circle",
                        "source": {
                            "type": "geojson",
                            "data" : geojson 
                        },
                        "paint": styles[pack.name + '-point'] 
                    }, before);
                }
            }
            else {
                map.getSource(pack.id).setData(geojson);
            }
        });
        // END LOOP

        //console.log(polyFeatures, ' poly features');


        // Add no territory packs to legend data

        if (years[year].noTerritory) {
            legendData.noTerritory = years[year].noTerritory;
        }

        // Remove the previous years packs that aren't in the current year

        lastYearPacks.map(id => {
            map.removeLayer(id);
            map.removeSource(id);
        });

        if (this.state.zoomOnYearChange) {
            var newBbox = bbox(polyFeatures)
            map.fitBounds(newBbox, { duration: 700, padding: 20 });
        }

        // Add label layer
        if (!map.getSource('pack-labels')) {
            map.addLayer({
                "id": "pack-labels",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": labels
                },
                "layout": {
                    "text-field": '{pack}',
                    "text-size" : 14,
                    "text-allow-overlap" : true
                },
                "paint" : {
                    //"text-color": '#ffffff'
                    "text-color": '#000000'
                },
                "minzoom" : 0,
                "maxzoom" : 18,
            });
        } else {
            map.getSource('pack-labels').setData(labels);
        }
        this.setState({ legendData });
    }

    changeYear(year) {
        const { popup } = this.state;
        this.setState({ currentYear : year });
        this.getYearData(year);
        popup.remove();
    }

    hoverPack(pack) {
       const { popup, map } = this.state;
       popup.remove();
       var activePack = polyFeatures.features.find(function(feature) {
           return feature.properties.name === pack.name;
       });

       var pack = {
              "type" : "FeatureCollection",
              "features" : [ activePack ] 
       }

       var newCentre = centroid(pack)
       const props = activePack.properties;
       popup.setLngLat([newCentre.geometry.coordinates[0], newCentre.geometry.coordinates[1]])
       .setHTML(
           '<div class="popUp">' + 
               '<div class="popHeader ' + props.id + '"> ' + props.name + '</div>' +
               '<div>Adults: ' + (typeof props.adults !== 'undefined' ? props.adults : 'N/A') + '</div>' +
               '<div>Pups: ' + (typeof props.pups !== 'undefined' ? props.pups : 'N/A') + '</div>' +
               '<div>Total: ' + (typeof props.total !== 'undefined' ? props.total : (props.pups + props.adults)) + '</div>' +
           '</div>'
        )
       .addTo(map);
    }

    render() {
        const { allYears, currentYear, legendData } = this.state;
        console.log(legendData, ' legend data from state');


        return (
            <div id="map">
            <ul className="yearToggle">
                { allYears.map(year => {
                    return (
                        <li 
                            className={currentYear === year ? 'active' : ''}
                            onClick={() => this.changeYear(year)}
                         >
                            {year}
                         </li>
                    )
                })}
            </ul>
            <table className="legend">
                <caption className="legendHead">Packs</caption>
                <tbody>
                    { legendData.packs && legendData.packs.map(pack => {
                        return (
                            <tr onMouseOver={() => this.hoverPack(pack)}>
                                <td className={"colourCode " + pack.id}></td>
                                <td>{pack.name}:</td>
                                <td>{pack.data.total}</td>
                            </tr>    
                        )
                    })}

                    { legendData.noTerritory ? <tr><td> No Territory: </td></tr> : false }

                    { legendData.noTerritory && legendData.noTerritory.packs && legendData.noTerritory.packs.map(pack => {
                        return (
                            <tr>
                                <td className={"colourCode " + pack.id}></td>
                                <td>{pack.name}:</td>
                                <td>{pack.data.total}</td>
                            </tr>    
                        )
                    })}

                    { legendData.noTerritory && legendData.noTerritory.captive ? 
                        <tr>
                            <td> Captives : </td>
                            <td> { legendData.noTerritory.captive.numbers.total} </td>
                        </tr>
                    : false }

                    { legendData.noTerritory && legendData.noTerritory.loners ? 
                        <tr>
                            <td> Loners: </td>
                            <td> { legendData.noTerritory.loners.numbers.total} </td>
                        </tr>
                    : false }

                    { legendData.noTerritory && legendData.noTerritory.unknown ? 
                        <tr>
                            <td> Unknown: </td>
                            <td> { legendData.noTerritory.unknown.numbers.total } </td>
                        </tr>
                    : false }
                    <tr> 
                        <td> Total: </td>
                        <td> {legendData.total} </td>
                    </tr>
                </tbody>
            </table>
            {/*


            <ul className="mapOpts">
                <div className="optsWrap">
                    <div className="ui toggle checkbox">
                        <input type="checkbox" name="public" />
                        <label>Show Labels</label>
                    </div>

                    <div className="ui toggle checkbox">
                        <input type="checkbox" name="public" />
                        <label>Adjust map on year change</label>
                    </div>

                </div>
                <i className="fa fa-gear"></i>
            </ul>
            */}
        </div>
      );
   }
}

export default Map;
