import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import '../css/mapbox.css';
import Select from 'react-select';

import YearSelect from './Utility/YearSelect.js';

import { getAllYears, formatYearData } from '../functions.js';

const packs = require('../data/wolf-report-data.json')
const noTerritory = require('../data/no-territory.json')


const years = require('../data/year-data.json')
const styles = require('../styles.json')

//console.log('packs', packs);
//console.log(noTerritory, ' no territory');

let activePacks = [];
let legendData;

let allYears = getAllYears();
const newShit = formatYearData(allYears, noTerritory, packs);

//console.log('years', years);

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
        this.changeYear = this.changeYear.bind(this);
        this.state = {
            currentYear : '2017',
            map : false,
            popup: false,
            legendData : [],
            zoomOnYearChange : true,
            packsLegendOpen : window.innerWidth > 900 ? true : false
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
            this.getYearData('2017');
        });

        // Clear these every time component mounts
        activePacks = [];
        legendData = false;
    }

    getYearData(year) {

        const { map, popup } = this.state;
        const yearData = years[year];

        let geojson;
        let lastYearPacks   = JSON.parse(JSON.stringify(activePacks));
        polyFeatures.features = [];
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
                        //"paint": styles[pack.name + '-point'] 
                    }, before);
                }
            }
            else {
                map.getSource(pack.id).setData(geojson);
            }
        });
        // END LOOP


        // Add no territory packs to legend data
        if (years[year].noTerritory) {
            legendData.noTerritory = years[year].noTerritory;
        }
        this.setState({ legendData });

        // Remove the previous years packs that aren't in the current year
        lastYearPacks.map(id => {
            map.removeLayer(id);
            map.removeSource(id);
        });

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

        if (this.state.zoomOnYearChange) {
            var newBbox = bbox(polyFeatures)
            map.fitBounds(newBbox, { duration: 700, padding: 20 });
        }

    }

    changeYear = (newYear) => {
        //let allYears = this.state.allYears;

        if (allYears.indexOf(newYear) !== -1) { 
            const { popup } = this.state;
            this.setState({ currentYear : newYear });
            this.getYearData(newYear);
            popup.remove();
        }
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
        const { currentYear, legendData, packsLegendOpen } = this.state;
        //console.log(legendData, ' legend data from state');

        return (
            <div id="map">
            <YearSelect 
                currentYear={currentYear}
                allYears={allYears}
                changeYear={this.changeYear}
            />
            <ul className="yearToggle">
                { allYears.map(year => {
                    return (
                        <li  
                            key={year}
                            className={currentYear === year ? 'active' : ''}
                            onClick={() => this.changeYear(year)}
                         >
                            {year}
                         </li>
                    )
                })}
            </ul>

            <button className="legend-toggle" onClick={() => this.setState({ packsLegendOpen : !packsLegendOpen})}>
               <i className="fas fa-info-circle"></i>
               Packs 
            </button>

            <table className={"legend " + (packsLegendOpen ? "visible" : "hidden")}>
                <caption className="legendHead">Packs</caption>
                <tbody>
                    { legendData.packs && legendData.packs.map(pack => {
                        return (
                            <tr key={pack.id} onMouseOver={() => this.hoverPack(pack)}>
                                <td className={"colourCode " + pack.id}></td>
                                <td>{pack.name}:</td>
                                <td>{pack.data.total}</td>
                            </tr>    
                        )
                    })}

                    { legendData.noTerritory && legendData.noTerritory.packs ? <tr><td colSpan="3"> No Territory: </td></tr> : false }

                    { legendData.noTerritory && legendData.noTerritory.packs && legendData.noTerritory.packs.map(pack => {
                        return (
                            <tr key={pack.id}>
                                <td className={"colourCode " + pack.id}></td>
                                <td>{pack.name}:</td>
                                <td>{pack.data.total}</td>
                            </tr>    
                        )
                    })}

                    { legendData.noTerritory && legendData.noTerritory.captive ? 
                        <tr>
                            <td colSpan="3"> 
                                Captives : { legendData.noTerritory.captive.numbers.total} 
                            </td>
                        </tr>
                    : false }

                    { legendData.noTerritory && legendData.noTerritory.loners ? 
                        <tr>
                            <td colSpan="3"> 
                                Lone Wolves : { legendData.noTerritory.loners.numbers.total} 
                            </td>
                        </tr>
                    : false }

                    { legendData.noTerritory && legendData.noTerritory.unknown ? 
                        <tr>
                            <td colSpan="3">
                                Unknown : { legendData.noTerritory.unknown.numbers.total } 
                            </td>
                        </tr>
                    : false }
                    <tr> 
                        <td colSpan="3" className="total"> 
                             Total : {legendData.total}
                        </td>
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
