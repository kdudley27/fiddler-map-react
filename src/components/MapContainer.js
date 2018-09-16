import React, { Component } from 'react'
import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react';
import highlightMarkerIcon from '../imgs/icons/highlight_marker.png'
import LIMarker from '../imgs/icons/userSelectedLIt_marker.png'

export class MapContainer extends Component {

  constructor(props) {
    super(props);
      this.state = {
        isInfoWindowOpen: false, // default infoWindow state closed
        hasDropped: false, // default state is false until app loads and marker drops once
        bounds: {}, // map bounds received from App.js state // fetches
        activeMarker: {}, // marker object that is hovered // clicked
        selectedPlace: {}, // marker object that is clicked
        clickedMarkerID: '', // id of marker that is clicked
        highlightMarkerIcon: {
        url: highlightMarkerIcon,
        scaledSize: new this.props.google.maps.Size(27, 43), // scaled size
        },
        mouseOver: false, // default false unless marker is hovered
        clickedMarkerDetails: [], // fetch details for clicked marker
      }
      this.onMarkerClick = this.onMarkerClick.bind(this)
      this.onMapClicked = this.onMapClicked.bind(this)
      this.handleMouseOver = this.handleMouseOver.bind(this)
      this.handleMouseExit = this.handleMouseExit.bind(this)
      this.onInfoWindowClose = this.onInfoWindowClose.bind(this)
      this.animateMarker = this.animateMarker.bind(this)
  };

  componentWillMount() {
    // get the map bound from App.js and set the google map bounds
    let mapBounds = new this.props.google.maps.LatLngBounds(...this.props.bounds);
      this.setState({ bounds: mapBounds})

  }

  componentDidMount() {


    // after map load, comminucate animation has dropped complete so markers don't keep dropping
    setTimeout(() => {
      this.setState({
        hasDropped: true
      })

    }, 1000)
  }

  // if a marker is clicked we want it to have a different color than it's hover state and an info window to open/close
  onMarkerClick= (props, marker, e) => {
    // if a marker is clicked on, and then another is hovered over - but not yet clicked on - an infoWindow is open still open, so we need to give the new infoWindow the details of the correct restaurant
    if (this.state.mouseOver || (!this.props.onMobile && !this.state.mouseOver)) {
      // filter which restaurant from the "points" on our map
      let details = this.props.points.filter(point => point.id === marker.id)
      // set state to reflect the current selected marker and info
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        clickedMarkerID: marker.id,
        isInfoWindowOpen: this.state.isInfoWindowOpen? false: true,
        clickedMarkerDetails: details,
      })
    }
    // if we are on mobile, there is no mouseOver/hover state, we need to do the same as above but only for a clicked item
    if (this.props.onMobile) {
      let details = this.props.points.filter(point => point.id === marker.id)
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        clickedMarkerID: marker.id,
        isInfoWindowOpen: this.state.isInfoWindowOpen? false: true,
        clickedMarkerDetails: details
      })
    }
    // returns results to parent component, App.js
    this.checkforActiveMarker()
  };

  checkforActiveMarker = () => {
    // Object.keys(someObject) will ALWAYS return false with ===, use ==
    // if there is an active marker there will be a key in the object, state will be false
    // return this to our parent component App.js
    // eslint-disable-next-line
    let isMarkerActive = (Object.keys(this.state.activeMarker) == 0)
    // return the state to its parent, app.js
    this.props.wasMarkerClicked(isMarkerActive)
  }

  // set state on hover for correct marker color
  handleMouseOver = (props, marker, e) => {
    if (!this.state.mouseOver) {
      this.setState({
          hasDropped: true,
          selectedPlace: props,
          activeMarker: marker,
          mouseOver:true
      })
    }



  };

  // when the mouse leaves the marker
  handleMouseExit = (props, marker, e) => {
    // if an infoWindow is not open, the marker may have been clicked but is no longer active set it's state
    if (this.state.isInfoWindowOpen) {
      this.setState({
        clickedMarkerID: '',
        mouseOver: false
      })
      return
    }
    // return the marker to it's original state
      this.setState({
        selectedPlace: {},
        activeMarker: {},
        mouseOver: false,
        clickedMarkerID: ''
      });
  };

  // determines the marker's animation
  // typeof cur, props, marker, e = object
  animateMarker = (cur, props, marker, e) => {
    if (this.props.userSelectedLI === cur.id)
      return 1 // bounce
    if (this.state.mouseOver === false)
      return 0
    if (this.state.clickedMarkerID === cur.id)
      return 0 // do nothing
    if (this.state.selectedPlace.id === cur.id)
      return 4 // bobble



    // !this.state.hasDropped ? this.props.google.maps.Animation.DROP : this.props.userSelectedLI === cur.id || this.state.activeMarker.id === cur.id ? '4' : '0'
    return 0 // do nothing
  }


  // if the map was clicked we need to return it to it's original state
  onMapClicked = (props) => {
    // if an info window is open
    if (this.state.isInfoWindowOpen || this.state.clickedMarkerID !== '') {
      this.setState({
        isInfoWindowOpen: false,
        activeMarker: {},
        selectedPlace: {},
        clickedMarkerID: ''
      })
    }
    // if the user is on mobile and there is no mouseExit/mouseOver we need to clear the state
    if (this.props.onMobile) {
      this.setState({
        isInfoWindowOpen: false,
        activeMarker: {},
        selectedPlace: {},
        clickedMarkerID: ''
      })
    }
    // returns results to parent component, App.js
    this.checkforActiveMarker();
  };

  // when an infoWindow is closed we need to clear the active marker
  onInfoWindowClose = (props, marker, e) => {
    this.setState({
      selectedPlace: {},
      activeMarker: {},
      isInfoWindowOpen: false,
      clickedMarkerID: ''
    })
  }

  render() {

    // our fetched restaurant data
    let { points, userSelectedLI, isPanelOpen } = this.props


    // when there is a clickedMarker we need to grab it's venue details
    let details = this.state.clickedMarkerDetails !== 0 ? this.state.clickedMarkerDetails : undefined


    return (
      <section>
        <Map className={isPanelOpen ? 'map' : 'map fullscreen-map'}
          google={this.props.google}
          zoom={13}
          initialCenter={{
            lat: 36.6606465,
            lng: -80.9136475
          }}
          bounds={this.state.bounds}
          disableDoubleClickZoom={true}
          draggable={false}
          scrollwheel={false}
          mapTypeControl={false}
          onClick={this.onMapClicked}
        >
          {points.map(cur =>
            <Marker
              key={cur.id}
              title={cur.name}
              address={cur.location.address}
              position={{lat: cur.location.lat, lng: cur.location.lng}}
              onClick={(props, marker, e) => this.onMarkerClick(props, marker, e)}
              id={cur.id}
              options={{gestureHandling: 'none'}}
              animation={!this.state.hasDropped? this.props.google.maps.Animation.DROP : this.animateMarker(cur)}
              onMouseover={ (props, marker, e) => this.handleMouseOver(props, marker, e)}
              onMouseout={(props,marker,e) => this.handleMouseExit(props, marker, e)}
              icon={userSelectedLI === cur.id ? LIMarker : this.state.clickedMarkerID === cur.id ? LIMarker : this.state.selectedPlace.id === cur.id? this.state.highlightMarkerIcon : undefined}

            />
          )}
          <InfoWindow
            className='infoWindow'
            marker={this.state.activeMarker}
            visible={this.state.isInfoWindowOpen}
                    maxWidth={150}
                    style={{position: 'absolute', width: '165px'}}
                    onClose={(props, marker, e) => this.onInfoWindowClose(props, marker, e)}
                    >
                    <div>
                      <h5 className='iw-title'>{this.state.selectedPlace.title}</h5>
                      <p>{details.length !== 0 ? details[0].location.address : undefined}<br/> {details.length !== 0 ? details[0].location.formattedAddress[1] : undefined}</p>
                      <p>{details.length !== 0? details[0].hours.status : undefined}</p>
                      <p>{details.length !== 0? details[0].contact.formattedPhone : undefined}</p>
                      <p><a href={details.length !== 0?  details[0].url: undefined}>Website</a></p>
                    </div>
                  </InfoWindow>

        </Map>
      </section>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDpeb7cdepUcyD121ewz5vYRRbIMQFv71M'
})(MapContainer)
