import React from 'react'
import { GoogleMap, LoadScript, Circle, Marker} from '@react-google-maps/api'


const mapStyles = {
    default: [],
    hide: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      },
      {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
      },
      {
          featureType: "road",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
      }
    ]
};

const size = {
  width:50,
  height:50
}

function MapContainer(props) 
{

  //updates the location over an interval
  const onLoad = () =>
  {
    setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          props.setCurrentLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        });
      }
      console.log("refreshed")
    }, 3000);
  }

  
  return (
    <div>
      <LoadScript
        googleMapsApiKey="AIzaSyAW1DRLXGAoITDvAMST32CkAh5xwN8VuIM"
      >
        <GoogleMap
          //THIS IS WHERE YOU STYLLLLLEEEE
          //also where you set what is visible with the controls
          options= {{
              styles:mapStyles['hide'],
              mapTypeControl:false,
              disableDefaultUI:true,
              draggable:false,
              zoomControl:true,
              minZoom:10
          }}
          id="44b929060bf5f087"
          mapContainerStyle=
          {{
              height: "86.5vh",
              width: "100%"
          }}
          center={{ lat: props.currentLoc.lat, lng: props.currentLoc.lng }}
          zoom={props.gameSize.zoom}
          onLoad={onLoad}
        >
          
          <Circle radius={props.gameSize.circleRadius} center={{ lat: props.currentLoc.lat, lng: props.currentLoc.lng }}/>
          <Marker 
            position={{ lat: props.currentLoc.lat, lng: props.currentLoc.lng }}   
            icon={{
              url: require('./Icons/player.svg'),
              scaledSize: size
            }}
          />
          {props.children}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

export default MapContainer;