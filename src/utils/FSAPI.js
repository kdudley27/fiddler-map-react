const URL = 'https://api.foursquare.com/v2/venues'
const CLIENT_ID = '4UIELGSD0TG2LAKKRDBODF4QXFLME00YKJNVTTHR3U3GAXPO'
const CLIENT_SECRET = 'SXAOBYTHRYBGKSATZHSOCVP21UGMPCQSQGXPAU1SEFNJLJYK'
const VERSION = 20180323
const RADIUS = '3000'
const RESULTS = '5'

// 36.6606465,-80.9136475 Galax,VA



export const getRestaurants = () =>
    fetch(`${URL}/explore?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${VERSION}&limit=${RESULTS}&ll=36.6606465,-80.9136475&query=food&radius=${RADIUS}`)
        .then(res => res.json())
        .then(data => data)

export const getRestaurantDetails = (venueID) =>
    fetch(`${URL}/${venueID}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${VERSION}`)
        .then(response => response.json()
          .then(text => ({
            json: text,
            meta: response
          }))
        )
        .then(({ json, meta }) => {
          return json
        })

export const search = () =>
    fetch(`${URL}/search?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${VERSION}&ll=36.6606465,-80.9136475&query=food&radius=${RADIUS}&intent=browse&limit=20`)
        .then(response => response.json())
        .then(response => console.log(response))
