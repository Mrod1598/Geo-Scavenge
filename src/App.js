import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import { Circle, InfoWindow} from '@react-google-maps/api'

import './App.css';
import MapContainer from './Components/MapContainer'
import Header from './Components/layout/Header'
import './Components/layout/layout.css'

function App(props) {
  //predined sizes to determine sizes
  const gameSizes = [1,2,3]
  const baseVisiblity = [false,false,false,false,false,false]
  const baseFound = [true,true,true,true,true]
  
  const [user,setUser] = useState(0)

  //controls what type of game you're playing
  const [gameMarkers,setGameMarkers] = useState([])
  const [gameInfoWindows,setGameInfoWindows] = useState([])
  //controls where the circle centers around
  const [currentLoc, setCurrentLoc] = useState({
    lat: 42.331429,
    lng: -83.045753, 
  });
  //changes based on gameType
  const [gameSize,setGameSize] = useState({circleRadius:0, zoom: 14.5})
  const [game,setGame] = useState(null)
  const [gameLatLngs,setGameLatLngs] = useState([])
  //used to not have the markers created a million times
  const [gameStart,setGameStart] = useState(false)
  const [points,setPoints] = useState(0)

  //this is an array to store the different boolean values for whether or not a picture is currently visible
  const [pictureVisible,setPictureVisible] = useState(baseVisiblity)
  //used to track the finished box to say whether or not it's visible
  const [foundVisible,setFoundVisible] = useState(false)
  //used to figure out which games aren't finished yet.
  const [allFound,setAllFound] = useState(baseFound)
  const [gameOver,setGameOver] = useState(false)

  //starts the game by fetching places by a designated offset and pushing them into a temp set of markers then saving them in state
  const createGame = async (gameSize) => {
    let addresses = []
    let tempGameMarkers = []
    let tempInfo = []
    let tempLatLngs = []
    for(let i=0;i<5;i++)
    {
      let lat = currentLoc.lat + getOffset(gameSize)
      let lng = currentLoc.lng + getOffset(gameSize)
      let radius
      let currentAddress = ""
      
      if(gameSize === gameSizes[0])
        radius = 250
      else if(gameSize === gameSizes[1])
        radius = 300
      else if(gameSize === gameSizes[2])
        radius = 350
      
      //proxy url
      const proxyurl = "https://cors-anywhere.herokuapp.com/"
      let url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=e&inputtype=textquery&fields=geometry,formatted_address,name&locationbias=circle:' + radius + '@'+ lat + ',' + lng + '&key=API_Key'
      
      let grabPlace = await fetch(proxyurl + url)
      .then(response => response.json())
      
      while(grabPlace.status === "ZERO_RESULTS")
      {
        lat = currentLoc.lat + getOffset(gameSize)
        lng = currentLoc.lng + getOffset(gameSize)
        let url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=e&inputtype=textquery&fields=geometry,formatted_address,name&locationbias=circle:' + radius + '@'+ lat + ',' + lng + '&key=API_Key'
        grabPlace = await fetch(proxyurl + url)
        .then(response => response.json())
      }
      currentAddress = grabPlace.candidates[0].formatted_address
      while(addresses.includes(currentAddress) || grabPlace.status === "ZERO_RESULTS")
      {
        lat = currentLoc.lat + getOffset(gameSize)
        lng = currentLoc.lng + getOffset(gameSize)
        let url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=e&inputtype=textquery&fields=geometry,formatted_address,name&locationbias=circle:' + radius + '@'+ lat + ',' + lng + '&key=API_Key'
        grabPlace = await fetch(proxyurl + url)
        .then(response => response.json())
        if(grabPlace.status !== "ZERO_RESULTS")
        {
          currentAddress = grabPlace.candidates[0].formatted_address
        }
      }
      addresses.push(currentAddress)
      tempLatLngs.push({lat: grabPlace.candidates[0].geometry.location.lat,lng: grabPlace.candidates[0].geometry.location.lng})

      let imgSrc =  "https://maps.googleapis.com/maps/api/streetview?soource=outdoor&location="+ grabPlace.candidates[0].geometry.location.lat + "," + grabPlace.candidates[0].geometry.location.lng + "&size=300x300&key=API_Key"
      tempInfo.push(
        <InfoWindow
          class="infoBox"
          key={"gameInfoBox"+i} 
          position={{ lat, lng }}
        >
          <img src={imgSrc}/>
        </InfoWindow>
      )
      tempGameMarkers.push(
        <Circle 
          onClick={() => changePicVisibility(i)}
          key={"gameCircle"+i} 
          radius={radius} 
          center={{ lat, lng }}
        />
      )
    }
    setGameStart(true)
    setGameMarkers(tempGameMarkers)
    setGameInfoWindows(tempInfo)
    setGameLatLngs(tempLatLngs)
  }

  const changePicVisibility = (pictureNum) => {
    let tempPictureVis = pictureVisible
    tempPictureVis[pictureNum] = !tempPictureVis[pictureNum]
    setPictureVisible(tempPictureVis)
  }

  const getOffset = (gameSize) => {
    if(gameSize === 1)
      return Math.random() * (.014 + .014) - .014
    if(gameSize === 2)
      return Math.random() * (.028 + .028) - .028
    if(gameSize === 3)
      return Math.random() * (.0727 + .0727) - .0727;
  }  


  useEffect(() => {
    if(game === "1 mile")
    {
      createGame(gameSizes[0])
      setGameSize({circleRadius:1700.34, zoom: 14.5})
    }
    else if(game === "2 mile")
    {
      createGame(gameSizes[1])
      setGameSize({circleRadius:3300.68, zoom: 14})
    }
    else if(game === "5 mile")
    {
      createGame(gameSizes[2])
      setGameSize({circleRadius:8150.70, zoom: 13})
    }
    else if(game === "cancel")
    {
      setGameMarkers(null)
      setGameInfoWindows(null)
      setGameSize({circleRadius:0, zoom: 14.5})
    }
  },[game])

  useEffect(() => 
  {
    if(gameStart)
    {
      const counter = setInterval(() => {
        setPoints(points+30)
        for(let i = 0;i < 5;i++)
        {
          if(allFound[i] !== false)
          {
            let latDifference = currentLoc.lat - gameLatLngs[i].lat
            let lngDifference = currentLoc.lng - gameLatLngs[i].lng
            let distance = Math.sqrt(Math.pow(latDifference,2) + Math.pow(lngDifference,2))
            console.log("distance before" + distance);
            if(distance >= .005)
            {
              let tempAllFound = allFound
              tempAllFound[i] = false
              setAllFound(tempAllFound)
              setFoundVisible(true)
            }
          }
          if(allFound.every((singleFound) => singleFound == false))
          {
            console.log("game over")
            setGameOver(true)
            setGameStart(false)
            return () => clearInterval(counter)
          }
        }
      },3000)
      return () => clearInterval(counter)
    }
  },[game,gameStart,points,gameLatLngs])

  const saveHighscore = () => {
    const proxyurl = "https://cors-anywhere.herokuapp.com/"
    const url = "https://api-geoscavenge.azurewebsites.net"
    setGameOver(false)
    fetch(proxyurl + url + "/users/single", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          "user": user,
          "highscore": points,
          "highscore_type": game
      })
    })
    .then(response => {
        if(response.status == 400)
            console.log("there was an error saving the score")
        else if(response.status == 200)
            return response.json()
    }).then(json => {

    })
  }

  return (
    <Router>
      <div className="App">
        <Route exact path="/" render={props => (
          <div>
            <Header 
              game={game}
              setGame={setGame}
              setGameMarkers={setGameMarkers}
              currentLoc={currentLoc}
              gameStart={gameStart}
              setGameStart={setGameStart}
              setUser={setUser}
              user={user}
            />
            <MapContainer    
              game={game}
              setGame={setGame}
              setGameMarkers={setGameMarkers}
              gameStart={gameStart}
              setGameStart={setGameStart}
              currentLoc={currentLoc}
              setCurrentLoc={setCurrentLoc}
              gameSize={gameSize}
            >
              {/* had to put each in individually because couldn't figure out how to use conditionals 
              that were pushed in to an array and then displayed 
              like the markers */}
              {pictureVisible[0] && gameInfoWindows[0]}
              {pictureVisible[1] && gameInfoWindows[1]}
              {pictureVisible[2] && gameInfoWindows[2]}
              {pictureVisible[3] && gameInfoWindows[3]}
              {pictureVisible[4] && gameInfoWindows[4]}
              
              {/* displays where you're supposed to go. Also is split up so They can be hidden once found */}
              {allFound[0] && gameMarkers[0]}
              {allFound[1] && gameMarkers[1]}
              {allFound[2] && gameMarkers[2]}
              {allFound[3] && gameMarkers[3]}
              {allFound[4] && gameMarkers[4]}
              
            </MapContainer>
            {
              foundVisible &&
              <div className="found">
                You Found A Place!
                <br/>
                <button onClick={() => setFoundVisible(false)}>
                  Confirm
                </button>
              </div>
            }

            {
              (gameOver !== false) &&
              <div className="found">
                You Finished the game!
                <br/>
                  your score was:<br/> {points}
                <br/>
                {
                  user &&
                  <button onClick={saveHighscore()}>Save Score</button>
                }
                <button onClick={() => setGameOver(false)}>
                  Confirm
                </button>
              </div>
            }

            {
              gameStart &&
              <div className="found" style={{    
                top: "90%",
                left: "3%"
              }}>
                <h1>Points: {points}</h1>
              </div>
            }
            
          </div>
        )} />
      </div>
    </Router>
  );
}


export default App;
