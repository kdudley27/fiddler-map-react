import React, {Component} from 'react';
import FilterComponent from './components/FilterComponent'
import ListComponent from './components/ListComponent'
import BottomToggle from './components/BottomToggle'
import MapContainer from './components/MapContainer'
// eslint-disable-next-line
import * as foursquare from './utils/FSAPI'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isListOpen: true, 
      isPanelOpen: true, 
      wasLIClicked: false, 
      meta: {}, 
      bounds: [], 
      venue_ids: [], 
      allRestaurants: [], 
      query: '', 
      filterResults: [], 
      userSelectedLI: '', 
      onMobile: false, 
      isMarkerActive: false, 
      isOnline: true, 
      fetchError: false,
      errorMsg: '',
      googleMapError: true
    }

    this.toggleMobileListView = this
      .toggleMobileListView
      .bind(this)

    this.toggleListPanel = this
      .toggleListPanel
      .bind(this)

    this.filterInput = this
      .filterInput
      .bind(this)

    this.clearFilterInput = this
      .clearFilterInput
      .bind(this)

    this.getListId = this
      .getListId
      .bind(this)
    this.wasMarkerClicked = this
      .wasMarkerClicked
      .bind(this)

  }

  componentWillMount() {    
    if (window.matchMedia('(min-width: 750px)').matches) {      
      this.setState({onMobile: false, isListOpen: false, isPanelOpen: true, userSelectedLI: ''})

    } else {      
      this.setState({onMobile: true, isListOpen: true, isPanelOpen: false, userSelectedLI: ''})
    }
    
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 750px)').matches) {       
        this.setState({onMobile: false, isListOpen: true, isPanelOpen: true, userSelectedLI: ''})

      } else {        
        this.setState({onMobile: true, isListOpen: true, isPanelOpen: false, userSelectedLI: ''})
      }

    });
   
    window.addEventListener('online', this.updateConnectionStatus);
    window.addEventListener('offline', this.updateConnectionStatus);
   
    window.onunhandledrejection = function(e) {      
      if (e.reason.target.src.includes('maps.googleapis.com')) {
       
        let strSplit = e.reason.target.src.split('/js')[0]
       
        let el = document.getElementById('googleMap').firstElementChild
        
        el.setAttribute('class', 'map mapStatus fullscreen-map')
        
        el.innerHTML = 'There was a problem loading the Google Maps API, '+ strSplit +',\n Please insure that your firewall is allowing the API through.'
      }
    }

  }

  componentDidMount() {   
    window.gm_authFailure = () => {

      let html=  '<div ref=\'map\' class=\'authFailure\'>Google Maps has encountered an error loading.</div>'

      let pContainer = document.getElementsByClassName('gm-err-content')[0]
      pContainer.innerHTML = html

      this.setState({
       googleMapError: true
      })
    }
   
    foursquare.getRestaurants()
      .then(res=> {
        this.setState({
          meta: {code: res.meta.code},
          bounds: [res.response.suggestedBounds.sw, res.response.suggestedBounds.ne]
        })
        if (this.state.meta.code === 200 || this.state.meta.code === 304) {
          return res.response.groups[0].items
        }
      })
      .then(restaurants => {

        let ids = []

        restaurants.map(restaurant =>
          ids.push(restaurant.venue.id)
        )
        this.setState({
          venue_ids: ids
        })

        return ids
      })
      .then(ids => {

        let venueDetails = []
        ids.map(venueID =>
          
          foursquare.getRestaurantDetails(`${venueID}`)
            .then(details => {
              if (details.meta.code !== 200) {
                this.setState({
                  meta: details.meta,
                  fetchError: true,
                  errorMsg: details.meta.code+' Error in: FSgetDetails() Promise: ' + details.meta.errorDetail +'\n There could be problem with your internet connection. Please check your connection and try again'
                })
              } else {
                this.setState({
                  meta: details.meta
                })
              }
              
              venueDetails.push(details.response.venue)
              return venueDetails
            })
            .then(venueDetails => {
              if (this.state.meta.code === 200 || this.state.meta.code === 304) {
                this.setState({allRestaurants: venueDetails, filterResults: venueDetails})
              }
            })
          .catch(err => console.log(this.state.meta.code +', '+this.state.meta.errorDetail))
        )

      })
      .catch(err => {
        this.setState({
          fetchError: true,
          errorMsg: 'Error in: FS.getRestaurants() Promise: ' + err +'\n There is a problem with your internet connection. Please try again when your connection has been re-established.'
        })
      })


    } 


  updateConnectionStatus = (e) => {
    e.type === 'offline'
      ? this.setState({isOnline: false, fetchError: true, googleMapError: true})
      : this.setState({isOnline: true, fetchError: false, googleMapError: false})
  }
 
  toggleMobileListView(e) {
    this.setState({
      isListOpen: !this.state.isListOpen
    })
  }
  
  toggleListPanel(e) {
    this.setState({
      isPanelOpen: !this.state.isPanelOpen
    })
  }
  
  clearFilterInput = () => {    
    if (this.state.query === '')
      return

    this.setState({
      query: '',
      filterResults: [...this.state.allRestaurants]
    })
  }
  
  filterInput = (query) => {
    this.setState({query: query});
    this.userDefinedFilter(query);
  }
  
  userDefinedFilter = (query) => {
   
    if (query === '') {
      this.setState({
        filterResults: [...this.state.allRestaurants]
      });
      return;
    }
   
    this.setState({
      filterResults: [...this.state.allRestaurants].filter(restaurant => new RegExp(query, 'i').exec(restaurant.name))
    })
  }
 
  getListId = (id, isMarkerActive) => {

    if (this.state.userSelectedLI === id && this.state.wasLIClicked && this.state.userSelectedLI !== '') {
      this.setState({wasLIClicked: false, userSelectedLI: ''})
      return
    }
    this.setState({wasLIClicked: true, userSelectedLI: id})
  }
  
  wasMarkerClicked = (isMarkerActive) => {
    this.setState({
      isMarkerActive: !isMarkerActive
    })
  }


  render() {

    return (<div className='App'>

      <header className='header' role="banner">
        <h2 className='header-title'>My Favorite Places to Eat</h2>
      </header>
      <main>
        <section>
          <FilterComponent
            filterInput={this.filterInput}
            query={this.state.query}
            clearFilterInput={this.clearFilterInput}
            role="region"
            aria-label="filter restaurants by name"
          />

          <ListComponent
            toggleClassName={this.toggleListPanel}
            getListId={this.getListId}
            filterResults={this.state.filterResults}
            onMobile={this.state.onMobile}
            isPanelOpen={this.state.isPanelOpen}
            isListOpen={this.state.isListOpen}
            isMarkerActive={this.state.isMarkerActive}
            userSelectedLI={this.state.userSelectedLI}
            isOnline={this.state.isOnline}
            fetchError={this.state.fetchError}
            errorMsg={this.state.errorMsg}
          />
          <BottomToggle
            toggleClassName={this.toggleMobileListView}
            isListOpen={this.state.isListOpen}
          />
        </section>

        <section id='googleMap'>{(!this.state.googleMapError|| this.state.isOnline || !this.state.fetchError)?
          <MapContainer role="application"
            aria-label="Google Map"
            wasMarkerClicked={this.wasMarkerClicked}
            getListId={this.getListId}
            bounds={this.state.bounds}
            points={this.state.filterResults}
            userSelectedLI={this.state.userSelectedLI}
            isPanelOpen={this.state.isPanelOpen}
            onMobile={this.state.onMobile}
          />
        : <div ref='map' className={this.props.isPanelOpen ? 'map mapStatus' : 'map mapStatus fullscreen-map'}>Google Maps requires an internet connection and will not load until your connection has been re-established.</div>}
        </section>
      </main>
      <footer className='footer'></footer>

    </div>);
  }
}

export default App;
