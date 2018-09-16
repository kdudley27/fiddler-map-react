import React from 'react'
import noImage from '../imgs/restaurantImages/noImage.png'

class ListItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isListItemOpen: false, // list item built custom to resemble accordian behavior - is it open
      listItem: '' // holds the venueID of the list item that was clicked on
    }
  }


  handleListClick = (e) => {
    e.stopPropagation();
    // console.log(e.target.getAttribute('js-data'));

    // overcome Reacts lack of event delegation with a simple js-data attribute set to the id of the restaurant the element was created to display
    this
      .props
      .getListId(e.target.getAttribute('js-data'))

    // if the user is viewing on a small screen we want the marker to keep bounce and not timeout because the list is open and the user can't see the map behind it until they close the list
    if (this.props.onMobile) {
      this.setState({
        isListItemOpen: true, // list items will never close on click
        listItem: e
          .target
          .getAttribute('js-data') // set the venueID of the LI that was clicked in state
      })
      return // we are done
    }

    // if the user is not on mobile
    this.setState({
      isListItemOpen: !this.state.isListItemOpen, // the list items act like accordians open/close
      listItem: e
        .target
        .getAttribute('js-data') // set the venueID of the LI that was clicked in state
    })

    // if we are not on mobile and a list item was clicked, we want the marker to change color and animate breifly, then return to it's original state
    setTimeout(() => {
      this
        .props
        .getListId('')
    }, 1000)
  }

  render() {
    const { filterResults, onMobile } = this.props


    return (<ul
      role="tablist"
      aria-label={'A list of Locations where you can find some great locations in Galax'}>
      {
        filterResults.map(place => {
          return (
            <li
              role='tab'
              id={place.id} className={!onMobile? (this.state.isListItemOpen && this.state.listItem === place.id
                ? 'restaurant-list-item'
                : 'restaurant-list-item-closed'): 'restaurant-list-item'} key={place.id} tabIndex='0' onClick={this.handleListClick} js-data={place.id} aria-label={`${place.name}`} aria-expanded={this.state.isListItemOpen
                  ? 'true'
                  : 'false'}>

              <img
                js-data={place.id}
                aria-hidden={
                  this.state.isListItemOpen
                    ? 'true'
                    : 'false'}
                className={!onMobile ? (
                  this.state.isListItemOpen && this.state.listItem === place.id
                    ? 'list-image'
                    : 'hide-image') : 'list-image'} src={!place.bestPhoto.prefix
                      ? noImage
                      : place.bestPhoto.prefix + '80x80' + place.bestPhoto.suffix} alt={!place.description
                        ? place.name
                        : place.description
                      }
              />

              <div
                className="list-info-wrapper"
                js-data={place.id}
              >

                <h5
                  className={!onMobile?
                    (this.state.isListItemOpen && this.state.listItem === place.id? 'list-title minus': 'list-title plus'): 'list-title'}
                  js-data={place.id}>{place.name}
                </h5>


                <p className="rating"
                  js-data={place.id}>Rating: {place.rating} out of 10
                  <span className="review-count" js-data={place.id}>({place.likes.count} reviews)</span>

                </p>

                <p
                  className="cuisines"
                  js-data={place.id}>
                  {
                    place
                    .attributes
                    .groups[0]
                    .summary
                  }
                  - Barbecue -
                  {place.location.address}

                </p>

                <p className="address" js-data={place.id}>

                  {
                    place
                    .tips
                    .groups[0]
                    .items[0]
                    .text
                  }

                </p>

                <p
                  className="hours-status"
                  js-data={place.id}>{
                    place.hours
                      ? place.hours.status
                        ? place.hours.status
                        : ''
                      : ''
                  }
                </p>

              </div>
            </li>)
        })
      }
    </ul>)
  }
}

export default ListItem
