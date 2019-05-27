import React, { Component } from 'react';

class ChartSettings extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            open : false,
            min : 0,
            max : 40
        };
    }

    changeVal(minOrMax, update, e) {
        let { chart } = this.props;
        
        if (minOrMax === 'min') {
            this.setState({ min : e.target.value });
        } else {
            this.setState({ max : e.target.value });
        }

        if (update) {
            chart.options.scales.yAxes[0].ticks[minOrMax] = parseInt(e.target.value);
            chart.update();
        }
    }

  render() {
      const { open, min, max } = this.state;

      return (
        <div className="chart-settings-wrap">
            <i  
                className={"fas fa-cog " + ( open ? 'active' : '' )}
                onClick={() => this.setState({ open : ! open })}
            />
            { open ? 
                <div className="chart-settings-panel">
                    <h2> Chart Options </h2>
                    <div className="chart-settings">
                        <div> 
                            <label> Min : </label> 
                            <input 
                                type="text"
                                value={min}
                                onChange={this.changeVal.bind(this, 'min', false)}
                                onBlur={this.changeVal.bind(this, 'min', true)}
                             />
                        </div>
                        <div> 
                            <label> Max : </label> 
                            <input 
                                type="text"
                                value={max}
                                onChange={this.changeVal.bind(this, 'max', false)}
                                onBlur={this.changeVal.bind(this, 'max', true)}
                            />
                        </div>
                    </div>
                </div>
            : false }
        </div>
      );
   }
}

export default ChartSettings;
