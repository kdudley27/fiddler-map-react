import React, {Component} from 'react';
import FilterComponent from './components/FilterComponent'
import ListComponent from './components/ListComponent'
import BottomToggle from './components/BottomToggle'
import MapContainer from './components/MapContainer'
// eslint-disable-next-line
import * as FS from './utils/FSAPI'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isListOpen: true, // default restaurant list open on mobile view - used in BottomListToggle
      isPanelOpen: true, // is the panel open in tablet and desktop view - ListComponent
      wasLIClicked: false, // if LI in list is clicked, state is true
      meta: {}, // response meta data from all fetches
      bounds: [], // suggestBounds returned from foursquare used to set google map bounds Object{ne: lat, lng, sw: lat, lng}
      venue_ids: [], // ids of all restaurants returned from our "area" fetch
      allRestaurants: [], // api only loads locations once to increase speed and reduce quotas
      query: '', // user's input into our filter
      filterResults: [], // copy of restaurants data to filter and hand out to our list and map
      userSelectedLI: '', // the LI that was clicked on by the user
      onMobile: false, // default desktop view - true if user is viewing on a small screen
      isMarkerActive: false, // is a marker currently highlighted or have animation
      isOnline: true, // false if connection is lost and app is served from cache
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
    // check initial screen orientation the user is viewing our app in
    if (window.matchMedia('(min-width: 750px)').matches) {
      console.log('Screen width is at least 750px');
      this.setState({onMobile: false, isListOpen: false, isPanelOpen: true, userSelectedLI: ''})

    } else {
      console.log('Screen less than 750px');
      this.setState({onMobile: true, isListOpen: true, isPanelOpen: false, userSelectedLI: ''})
    }

    // set an event listener to determine if the user flips screen orientation while viewing our app
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 750px)').matches) {
        console.log('Screen width is at least 750px');
        this.setState({onMobile: false, isListOpen: true, isPanelOpen: true, userSelectedLI: ''})

      } else {
        console.log('Screen less than 750px');
        this.setState({onMobile: true, isListOpen: true, isPanelOpen: false, userSelectedLI: ''})
      }

    });
    // monitor connection status
    window.addEventListener('online', this.updateConnectionStatus);
    window.addEventListener('offline', this.updateConnectionStatus);

    // listen an unhandledrejection error in the window in the case that a firewall is blocking the  google API from going through - the API will return not response/error message so we need to tell the user why their map is not working
    window.onunhandledrejection = function(e) {

      // make sure the reason for rejection is indeed google maps API
      if (e.reason.target.src.includes('maps.googleapis.com')) {

        // split the string and keep the first element of the array
        let strSplit = e.reason.target.src.split('/js')[0]

        // get the google map container's first Child element which will be an anyonymous <div> tag
        let el = document.getElementById('googleMap').firstElementChild

        // give it our class so that it responsive
        el.setAttribute('class', 'map mapStatus fullscreen-map')

        // Place the error message inside the div
        el.innerHTML = 'There was a problem loading the Google Maps API, '+ strSplit +',\n Please insure that your firewall is allowing the API through.'
      }
    }

  }

  componentDidMount() {
    // callback for custom error msg if error in the Google API request
    window.gm_authFailure = () => {

      let html=  '<div ref=\'map\' class=\'authFailure\'>Google Maps has encountered an error loading.</div>'

      let pContainer = document.getElementsByClassName('gm-err-content')[0]
      pContainer.innerHTML = html

      this.setState({
       googleMapError: true
      })
    }
   
      FS.getRestaurants()
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

          // Second request gets us the venue details for each restaurant returned in the first
          FS.getRestaurantDetails(`${venueID}`)
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
              // push the details into an array to use later
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


    } /// END OF componentDidMount() block



  updateConnectionStatus = (e) => {
    e.type === 'offline'
      ? this.setState({isOnline: false, fetchError: true, googleMapError: true})
      : this.setState({isOnline: true, fetchError: false, googleMapError: false})
  }

  // isListOpen = true
  toggleMobileListView(e) {
    this.setState({
      isListOpen: !this.state.isListOpen
    })
  }

  // isPanelOpen = true
  toggleListPanel(e) {
    this.setState({
      isPanelOpen: !this.state.isPanelOpen
    })
  }

  // clear our user's filter input when user clicks X button
  clearFilterInput = () => {
    // if the input is empty we don't want the map to rerender if we click the button
    if (this.state.query === '')
      return
      // if its not empty, set it back to our original state
    this.setState({
      query: '',
      filterResults: [...this.state.allRestaurants]
    })
  }

  // take the user input and set it in our state, then call userDefinedFilter
  filterInput = (query) => {
    this.setState({query: query});
    this.userDefinedFilter(query);
  }

  // function to find restaurants whose names match our user's input
  userDefinedFilter = (query) => {

    // if the input clear/ed through delete or backspace then set our app back to its original state
    if (query === '') {
      this.setState({
        filterResults: [...this.state.allRestaurants]
      });
      return;
    }

    // find restaurants whose names match our user's input
    this.setState({
      filterResults: [...this.state.allRestaurants].filter(restaurant => new RegExp(query, 'i').exec(restaurant.name))
    })
  }

  //@@ Used when LI is clicked
  //@@ typeof ID = string
  //@@ typeof isMarkerActive = boolean
  getListId = (id, isMarkerActive) => {

    if (this.state.userSelectedLI === id && this.state.wasLIClicked && this.state.userSelectedLI !== '') {
      this.setState({wasLIClicked: false, userSelectedLI: ''})
      return
    }
    this.setState({wasLIClicked: true, userSelectedLI: id})
  }

  // was a marker clicked on our map?
  wasMarkerClicked = (isMarkerActive) => {
    this.setState({
      isMarkerActive: !isMarkerActive
    })
  }


  render() {

    return (<div className='App'>

      <header className='header' role="banner">
        <h2 className='header-title'>Old Fiddler's Convention: Galax</h2>
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
