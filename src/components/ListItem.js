import React from 'react'
import noImage from '../imgs/restaurantImages/noImage.png'

class ListItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isListItemOpen: false, 
      listItem: '' 
    }
  }


  handleListClick = (e) => {
    e.stopPropagation();
   
    this
      .props
      .getListId(e.target.getAttribute('js-data'))
    
    if (this.props.onMobile) {
      this.setState({
        isListItemOpen: true, 
        listItem: e
          .target
          .getAttribute('js-data') // set the venueID 
      })
      return 
    }

    
    this.setState({
      isListItemOpen: !this.state.isListItemOpen, 
      listItem: e
        .target
        .getAttribute('js-data') // set the venueID 
    })

   
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
