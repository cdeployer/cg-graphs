import React, { Component } from 'react';
import update from 'react/lib/update'
import { connect } from 'react-redux';
import PlotlyGraph from './Plot.js';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { fetchDataIfNeeded, riskAndDateAreSelected } from '../actions/ChoroplethMapActions';


export class ChoroplethMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      graphID: 'ChoroplethMap',
      data: [{
        type: 'choropleth',
        locationmode: 'country names',
        locations: [],
        z: [],
        text: [],
        hoverinfo: 'location+text',
        autocolorscale: false,
        colorbar: {
          thickness: 5,
          len: 0.5
        },
        colorscale: [
          [0, 'rgb(231, 251, 245)'],
          [0.2, 'rgb(162, 239, 218)'],
          [0.4, 'rgb(115, 231, 199)'],
          [0.6, 'rgb(46, 219, 172)'],
          [0.8, 'rgb(0, 212, 154)'],
          [1, 'rgb(0, 174, 127)']
        ]
      }],
      layout: {
        height: 600,
        title: 'Performance of the countries around the world',
        geo: {
          showcountries: true,
          showframe: false,
          showcoastlines: false,
          projection:{
            type: 'equirectangular'
          }
        }
      }
    }

    this.handleChangeRisk = this.handleChange.bind(this, 'riskToShow')
    this.handleChangeDate = this.handleChange.bind(this, 'dateToShow')
  }


  handleChange(idx, object) {
    if(idx === 'riskToShow') {
      this.props.dispatch(fetchDataIfNeeded(
        object.value,
        this.props.view.date
      ))
      this.props.dispatch(riskAndDateAreSelected(
        object.value,
        this.props.view.date
      ))
    } else if (idx === 'dateToShow') {
      this.props.dispatch(fetchDataIfNeeded(
        this.props.view.risk,
        object.value
      ))
      this.props.dispatch(riskAndDateAreSelected(
        this.props.view.risk,
        object.value
      ))
    }
  }


  computeState(props=this.props) {
    let locations = []
    let counts = []
    let hoverInfo = []
    if(!props.view.isFetching && props.view.isFetched) {
      props.data[props.view.risk][props.view.date].forEach(entry => {
        if(props.countries[entry.country]) {
          locations.push(props.countries[entry.country].name)
          counts.push(entry.count)
          hoverInfo.push(entry.count_amplified)
        }
      })

      let max = Math.max(...counts)
      let z = counts.map(item => {
        return ( 100 * ( Math.log(item) / Math.log(max) ) )
      })

      return update(this.state, {
        data: [{
          locations: {$set: locations},
          z: {$set: z},
          text: {$set: hoverInfo}
        }]
      })
    }

    return {}
  }


  componentDidMount() {
    this.props.dispatch(fetchDataIfNeeded(this.props.view.risk, this.props.view.date))
  }


  componentWillReceiveProps(nextProps) {
    this.setState(this.computeState(nextProps))
  }


  render() {
    const riskSelectOptions = Object.values(this.props.risks).map(risk => {
      return {
        value: risk.id,
        label: risk.title
      }
    })
    return (
      <div>
        <PlotlyGraph
          data={this.state.data}
          graphOptions={this.state.layout}
          graphID={this.state.graphID}/>
        <div className="row">
          <div className="col-sm-2 col-sm-offset-4" title="Select a date">
            <Select
              value={this.props.view.date}
              name='dateToShow'
              onChange={this.handleChangeDate}
              clearable={false}
              options={[{value: this.props.view.date, label: this.props.view.date}]}/>
          </div>
          <div className="col-sm-2" title="Select a risk">
            <Select
              value={this.props.view.risk}
              name='riskToShow'
              onChange={this.handleChangeRisk}
              clearable={false}
              options={riskSelectOptions}/>
          </div>
        </div>

      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    view: state.ChoroplethMapViews,
    data: state.entities.cubeByRiskByDate,
    countries: state.entities.countries,
    risks: state.entities.risks
  }
}


export default connect(mapStateToProps)(ChoroplethMap);