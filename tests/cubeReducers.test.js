import { buildCube } from '../src/reducers/cubeReducers';

describe('buildCube reducer', () => {
  const initialState = {
    entities: {
      countries: {},
      risks: {},
      cubeByRiskByCountry: {},
      cubeByRiskByASN: {},
      cubeByRiskByDate: {}
    },
    countryPerformanceOnRiskViews: {
      'gb/1': {
        id: 'gb/1',
        country: 'gb',
        risk: 1,
        type: 'country/performance',
        mesure: 'count_amplified',
        isFetched: false,
        isFetching: false,
        didFailed: false,
      },
      'gb/100': {
        id: 'gb/100',
        country: 'gb',
        risk: 100,
        type: 'country/performance',
        mesure: 'count_amplified',
        isFetched: false,
        isFetching: false,
        didFailed: false,
      }
    },
    ASPerformanceViews: {
      'gb/1/174': {
        id: 'gb/1/174',
        country: 'gb',
        risk: 1,
        as: 174,
        type: 'as/performance',
        isFetched: false,
        isFetching: false,
        didFailed: false,
      }
    },
    ChoroplethMapViews: {
      isFetched: false,
      isFetching: false,
      didFailed: false,
      risk: 100,
      date: '2017-01-01'
    }
  }

  const stateClone = Object.assign({}, initialState)

  it('While requesting sets isFetching=true, shold not modify cube', () => {
    let newStore = buildCube(initialState, {
      type: 'FETCH_DATA_REQUEST',
      country: 'gb',
      risk: 1,
      graphId: 'gb/1',
      viewType: 'countryPerformanceOnRiskViews'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetching).toEqual(-1)
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetched).toBeFalsy()
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].didFailed).toBeFalsy()
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('On success it puts data in cubeByRiskByCountry and sets isFetched=true', () => {
    let data = [{
      "risk": 1,"country": "GB","date": "2017-01-16",
      "count": "11506","count_amplified": 4571746
    }]
    let newStore = buildCube(initialState, {
      type: 'FETCH_DATA_SUCCESS',
      data: data,
      country: 'gb',
      risk: 1,
      graphId: 'gb/1',
      viewType: 'countryPerformanceOnRiskViews'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetching).toEqual(1)
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetched).toBeTruthy()
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].didFailed).toBeFalsy()
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].unit).toEqual(undefined)
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].unitDevider).toEqual(1)
    expect(newStore.entities.cubeByRiskByCountry[1]['gb']).toEqual(data)
  })

  it('On success it unit is set aproproatelly if risk is DDOS', () => {
    let data = [{
      "risk": 100,"country": "GB","date": "2017-01-16",
      "count": "11506","count_amplified": 4571746
    }]
    let newStore = buildCube(initialState, {
      type: 'FETCH_DATA_SUCCESS',
      data: data,
      country: 'gb',
      risk: 100,
      graphId: 'gb/100',
      viewType: 'countryPerformanceOnRiskViews'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/100'].isFetching).toEqual(1)
    expect(newStore.countryPerformanceOnRiskViews['gb/100'].isFetched).toBeTruthy()
    expect(newStore.countryPerformanceOnRiskViews['gb/100'].didFailed).toBeFalsy()
    expect(newStore.countryPerformanceOnRiskViews['gb/100'].unit).toEqual('TBit/sec')
    expect(newStore.countryPerformanceOnRiskViews['gb/100'].unitDevider).toEqual(1000000)
  })

  it('On failure - no data is fetched and error message is returned', () => {
    let newStore = buildCube(initialState, {
      type: 'FETCH_DATA_FAILURE',
      error: 'test error',
      country: 'gb',
      risk: 1,
      graphId: 'gb/1',
      viewType: 'countryPerformanceOnRiskViews'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetching).toEqual(1)
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetched).toBeFalsy()
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].didFailed).toBeTruthy()
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].errorMessage).toEqual('test error')
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('When rank is received - it creates "rank" attribute in the view and sets isFetched=true', () => {
    let data = [{
       "country": "gb",
       "rank": "23"
    }]
    let newStore = buildCube(initialState, {
      type: 'GET_RANK_SUCCESS',
      data: data,
      country: 'gb',
      risk: 1,
      graphId: 'gb/1',
      viewType: 'countryPerformanceOnRiskViews'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].rank).toEqual("23")
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetching).toEqual(1)
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].isFetched).toBeTruthy()
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].didFailed).toBeFalsy()
  })

  it('On selector change it updates selectorConfig in views of store', () => {
    let newState = Object.assign({}, initialState, {
      countryPerformanceOnRiskViews: {
        'gb/1': {
          selectorConfig: [
            {disabled: true, country: "gb"},
            {disabled: true, country: "t"},
            {disabled: false, country: undefined}
          ]
        },
        'gb/2': {
          id: 'gb/1',
          country: 'gb',
          risk: 1,
          type: 'country/performance',
          isFetched: false,
          isFetching: false,
          didFailed: false,
          selectorConfig: [
            {disabled: true, country: "gb"},
            {disabled: true, country: "t"},
            {disabled: false, country: undefined}
          ]
        }
      }
    })
    let newStore = buildCube(newState, {
      type: 'SELECT',
      idxOfSelector: 2,
      selectedCountry: 'gb',
      graphId: 'gb/1'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].selectorConfig[2].country).toEqual('gb')
    expect(newStore.countryPerformanceOnRiskViews['gb/2'])
      .toEqual(newState.countryPerformanceOnRiskViews['gb/2'])
  })

  it('While requesting AS data it sets isFetching=true', () => {
    let newStore = buildCube(initialState, {
      type: 'FETCH_AS_DATA_REQUEST',
      country: 'gb',
      risk: 1,
      AsId: 174,
      graphId: 'gb/1/174'
    });
    expect(newStore.ASPerformanceViews['gb/1/174'].isFetching).toEqual(-1)
    expect(newStore.ASPerformanceViews['gb/1/174'].isFetched).toBeFalsy()
    expect(newStore.ASPerformanceViews['gb/1/174'].didFailed).toBeFalsy()
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('When AS data is fetched, it puts data in cubeByRiskByASN and sets isFetched=true', () => {
    let data = [{
      "country":"GB","risk":1,"asn":"174","date":"2017-01-20","count":18532
    }]
    let newStore = buildCube(initialState, {
      type: 'FETCH_AS_DATA_SUCCESS',
      data: data,
      country: 'gb',
      risk: 1,
      AsId: 174,
      graphId: 'gb/1/174'
    });
    expect(newStore.ASPerformanceViews['gb/1/174'].isFetching).toEqual(1)
    expect(newStore.ASPerformanceViews['gb/1/174'].isFetched).toBeTruthy()
    expect(newStore.ASPerformanceViews['gb/1/174'].didFailed).toBeFalsy()
    expect(newStore.entities.cubeByRiskByASN['gb/1/174']).toEqual(data)
  })

  it('When AS data fetching failed - no data is fetched and error message is returned', () => {
    let newStore = buildCube(initialState, {
      type: 'FETCH_AS_DATA_FAILURE',
      error: 'test error',
      country: 'gb',
      risk: 1,
      AsId: 174,
      graphId: 'gb/1/174'
    });
    expect(newStore.ASPerformanceViews['gb/1/174'].isFetching).toEqual(1)
    expect(newStore.ASPerformanceViews['gb/1/174'].isFetched).toBeFalsy()
    expect(newStore.ASPerformanceViews['gb/1/174'].didFailed).toBeTruthy()
    expect(newStore.ASPerformanceViews['gb/1/174'].errorMessage).toEqual('test error')
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('selectorConfig is updated when an ASN is selected', () => {
    let newState = Object.assign({}, initialState, {
      ASPerformanceViews: {
        'gb/1/174': {
          selectorConfig: [
            {disabled: true, as: 174},
            {disabled: true, as: 0},
            {disabled: false, as: undefined}
          ]
        },
        'gb/2/174': {
          id: 'gb/2/174',
          country: 'gb',
          risk: 1,
          as: 174,
          type: 'as/performance',
          isFetched: false,
          isFetching: false,
          didFailed: false,
          selectorConfig: [
            {disabled: true, as: 174},
            {disabled: true, as: 0},
            {disabled: false, as: undefined}
          ]
        }
      }
    })
    let newStore = buildCube(newState, {
      type: 'SELECT_AS',
      idxOfSelector: 2,
      selectedAS: 1111,
      graphId: 'gb/1/174'
    });
    expect(newStore.ASPerformanceViews['gb/1/174'].selectorConfig[2].as).toEqual(1111)
    expect(newStore.ASPerformanceViews['gb/2/174'])
      .toEqual(newState.ASPerformanceViews['gb/2/174'])
  })

  it('While requesting ChoroplethMap data it sets isFetching=true', () => {
    let newStore = buildCube(initialState, {
      type: 'FETCH_MAP_DATA_REQUEST',
      risk: 100,
      date: '2017-01-01'
    });
    expect(newStore.ChoroplethMapViews.isFetching).toEqual(-1)
    expect(newStore.ChoroplethMapViews.isFetched).toBeFalsy()
    expect(newStore.ChoroplethMapViews.didFailed).toBeFalsy()
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('When ChoroplethMap data fetching failed - no data is fetched and error message is returned', () => {
    let newStore = buildCube(initialState, {
      type: 'FETCH_MAP_DATA_FAILURE',
      error: 'test error',
      risk: 100,
      date: '2017-01-01'
    });
    expect(newStore.ChoroplethMapViews.isFetching).toEqual(1)
    expect(newStore.ChoroplethMapViews.isFetched).toBeFalsy()
    expect(newStore.ChoroplethMapViews.didFailed).toBeTruthy()
    expect(newStore.ChoroplethMapViews.errorMessage).toEqual('test error')
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('When ChoroplethMap data is fetched, it puts data in cubeByRiskByDate and sets isFetched=true', () => {
    let data = [{
      "risk": 100,
      "country": "AD",
      "date": "2017-01-01",
      "count": 2203,
      "count_amplified": 151589
    }]
    let newStore = buildCube(initialState, {
      type: 'FETCH_MAP_DATA_SUCCESS',
      data: data,
      risk: 100,
      date: '2017-01-01'
    });
    expect(newStore.ChoroplethMapViews.isFetching).toEqual(1)
    expect(newStore.ChoroplethMapViews.isFetched).toBeTruthy()
    expect(newStore.ChoroplethMapViews.didFailed).toBeFalsy()
    expect(newStore.entities.cubeByRiskByDate[data[0].risk][data[0].date]).toEqual(data)
  })

  it('selected risk and date in ChoroplethMapViews is updated after a user selects new parameters', () => {
    let newStore = buildCube(initialState, {
      type: 'SELECT_RISK_AND_DATE',
      selectedRisk: 1,
      selectedDate: '2017-02-01'
    });
    expect(newStore.ChoroplethMapViews.risk).toEqual(1)
    expect(newStore.ChoroplethMapViews.date).toEqual('2017-02-01')
  })

  it('When button selected measure is set aproproatelly', () => {
    let newStore = buildCube(initialState, {
      type: 'CHANGE_MEASURE',
      country: 'gb',
      risk: 1,
      graphId: 'gb/1',
      measure: 'count',
      viewType: 'countryPerformanceOnRiskViews'
    });
    expect(newStore.countryPerformanceOnRiskViews['gb/1'].normMeasure).toEqual('count')
    expect(newStore.entities).toEqual(initialState.entities)
  })

  it('Checks store is not mutated', () => {
    expect(initialState).toEqual(stateClone)
  })
})
