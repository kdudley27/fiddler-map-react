import React, { Component } from 'react'
import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react';
import highlightMarkerIcon from '../imgs/icons/highlight_marker.png'
import LIMarker from '../imgs/icons/userSelectedLIt_marker.png'

export class MapContainer extends Component {

  constructor(props) {
    super(props);
      this.state = {
        isInfoWindowOpen: false, 
        hasDropped: false, 
        bounds: {}, 
        activeMarker: {}, 
        selectedPlace: {}, 
        clickedMarkerID: '', 
        highlightMarkerIcon: {
        url: highlightMarkerIcon,
        scaledSize: new this.props.google.maps.Size(27, 43), 
        },
        mouseOver: false, 
        clickedMarkerDetails: [], 
      }
      this.onMarkerClick = this.onMarkerClick.bind(this)
      this.onMapClicked = this.onMapClicked.bind(this)
      this.handleMouseOver = this.handleMouseOver.bind(this)
      this.handleMouseExit = this.handleMouseExit.bind(this)
      this.onInfoWindowClose = this.onInfoWindowClose.bind(this)
      this.animateMarker = this.animateMarker.bind(this)
  };

  componentWillMount() {    
    let mapBounds = new this.props.google.maps.LatLngBounds(...this.props.bounds);
      this.setState({ bounds: mapBounds})

  }

  componentDidMount() {
    
    setTimeout(() => {
      this.setState({
        hasDropped: true
      })

    }, 1000)
  }
 
  onMarkerClick= (props, marker, e) => {    
    if (this.state.mouseOver || (!this.props.onMobile && !this.state.mouseOver)) {     
      let details = this.props.points.filter(point => point.id === marker.id)

      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        clickedMarkerID: marker.id,
        isInfoWindowOpen: this.state.isInfoWindowOpen? false: true,
        clickedMarkerDetails: details,
      })
    }
    
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
    this.checkforActiveMarker()
  };

  checkforActiveMarker = () => {   
    // eslint-disable-next-line
    let isMarkerActive = (Object.keys(this.state.activeMarker) == 0)
    
    this.props.wasMarkerClicked(isMarkerActive)
  }
  
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

  handleMouseExit = (props, marker, e) => {    
    if (this.state.isInfoWindowOpen) {
      this.setState({
        clickedMarkerID: '',
        mouseOver: false
      })
      return
    }
    
      this.setState({
        selectedPlace: {},
        activeMarker: {},
        mouseOver: false,
        clickedMarkerID: ''
      });
  };
  
  animateMarker = (cur, props, marker, e) => {
    if (this.props.userSelectedLI === cur.id)
      return 1 // bounce
    if (this.state.mouseOver === false)
      return 0
    if (this.state.clickedMarkerID === cur.id)
      return 0 // do nothing
    if (this.state.selectedPlace.id === cur.id)
      return 4 // bobble

    return 0 // do nothing
  }


  // if the map was clicked we need to return it to it's original state
  onMapClicked = (props) => {    
    if (this.state.isInfoWindowOpen || this.state.clickedMarkerID !== '') {
      this.setState({
        isInfoWindowOpen: false,
        activeMarker: {},
        selectedPlace: {},
        clickedMarkerID: ''
      })
    }
    
    if (this.props.onMobile) {
      this.setState({
        isInfoWindowOpen: false,
        activeMarker: {},
        selectedPlace: {},
        clickedMarkerID: ''
      })
    }
   
    this.checkforActiveMarker();
  };

  
  onInfoWindowClose = (props, marker, e) => {
    this.setState({
      selectedPlace: {},
      activeMarker: {},
      isInfoWindowOpen: false,
      clickedMarkerID: ''
    })
  }

  render() {

   
    let { points, userSelectedLI, isPanelOpen } = this.props


    
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
