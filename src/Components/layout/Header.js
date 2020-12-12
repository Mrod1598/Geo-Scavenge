import React, { useState, useRef, useEffect }  from 'react';
import { Link } from 'react-router-dom';
import './layout.css'
import { useOnClickOutside }  from  '../../Functions/OnClickOutside'
import { ReactComponent as Plus } from '../Icons/plus-sign.svg'
import { ReactComponent as Help } from '../Icons/help.svg'
import { ReactComponent as PersonIcon } from '../Icons/person.svg'
import { ReactComponent as ControllerIcon } from '../Icons/controllerIcon.svg'
import { ReactComponent as BackArrow } from '../Icons/backArrow.svg'
import { CSSTransition } from 'react-transition-group'

const url = "https://api-geoscavenge.azurewebsites.net"
const proxyurl = "https://cors-anywhere.herokuapp.com/"

function Header(props) {
    return (
        <div>
            <header style={headerStyle}>
                <h1>Geo Scavenge</h1>
                <h1></h1>
                    <NavBar>
                    <NavItem icon={ <ControllerIcon /> }>
                        <DropDownMenu
                            sentActiveMenu='game' 
                            setGame={props.setGame}
                        />
                    </NavItem>
                    <NavItem icon={ <Help /> }>
                        <DropDownMenu sentActiveMenu='help'/>
                    </NavItem>
                    <NavItem icon={ <PersonIcon /> }>
                        <DropDownMenu 
                            sentActiveMenu='profile'
                            user={props.user}
                            setUser={props.setUser}
                        />
                    </NavItem>
                </NavBar>
            </header>
            
        </div>
    );
}

function NavBar(props) {
    return (
        <nav className="navbar">
            {/* displays all selectable nav items */}
            <ul className="navbar-nav">{props.children}</ul>
        </nav>
    );
}

function NavItem(props) {

    //intializes the open bolean
    const [open, setOpen] = useState(false)

    //sets reference for the onclickoutside event
    const ref = useRef()
    //intializes the clickoutside event
    useOnClickOutside(ref, () => setOpen(false));

    return (
        <li className="nav-Item" ref={ref}>
            <a href="#" className="icon-button" onClick={() => setOpen(!open)}>
                {/* this is takes the passed in icon and displays it */}
                {props.icon}
            </a>
            {/* if open is true it opens the dropdown menu */}
            {open && props.children}
        </li>
    );
}

function DropDownMenu(props) {
    //used to grab the reference of the highscore menu to dynamically extend the length 
    const highscoreMenu = useRef()
    //general values to set up the different forms
    const [highscores,setHighscores] = useState("Loading...")
    const [username,setUserName] = useState("")
    const [password,setPassword] = useState("")
    const [regUsername,setRegUserName] = useState("")
    const [regPassword,setRegPassword] = useState("")
    const [regRePassword,setRegRePassword] = useState("")
    const [loginMessage,setLoginMessage] = useState("Loading...")
    //active menu tracks which is active so that it can change height accordingly
    const [activeMenu, setActiveMenu] = useState(props.sentActiveMenu);
    const [menuHeight, setMenuHeight] = useState(null);
    const [isCancelHidden, setIsCancelHidden] = useState(true);


    function calcHeight(el) {
        const height = el.offsetHeight+30;
        setMenuHeight(height);
    }

    const secondHandler = (game) => {
        if(game !== "cancel")
        {
            props.setGame(game)
            if(isCancelHidden)
            {
                setIsCancelHidden(false)
                setMenuHeight(menuHeight+50)
            }
        }
        else if(game === "cancel")
        {
            props.setGame(game)
            setIsCancelHidden(true)
            setMenuHeight(menuHeight-50)
        }
    }

    const login = () => {
        fetch(proxyurl + url + "/users/single", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "username": username,
                "password": password
            })
        })
        .then(response => {
            if(response.status == 400)
                setLoginMessage("There was an error logging in")
            else if(response.status == 200)
                return response.json()
        }).then(json => {
            let user = json
            props.setUser(user.user_id)
            setLoginMessage("you have logged in")
        })
    }

    const register = () => {
        if(regPassword !== regRePassword)
            setLoginMessage("passwords do not match")
        else 
        {
            fetch(proxyurl + url + "/users/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "username": regUsername,
                    "password": regPassword
                })
            })
            .then(response => {
                if(response.status == 400)
                {
                    setLoginMessage("There was an error logging in")
                    console.log(response.body)
                }
                else if(response.status == 200)
                {
                    return response.json()
                }
            }).then(json => {
                let user = json
                props.setUser(user.user_id)
                setLoginMessage("you have registered and logged in")
            })
        }
    }

    const getHighScore = (game) => {
        setHighscores("Loading...")
        fetch(proxyurl + url + "/highscores", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "game":game
            })
        })
        .then(response => {
            if(response.status == 400)
            {
                setHighscores("There was an error getting high scores")
                console.log(response.body)
            }
            else if(response.status == 200)
            {
                return response.json()
                
            }
        }).then(json => {
            let listedHSC = []
            let grabbedHighScores = json
            console.log(grabbedHighScores)
            grabbedHighScores.forEach((highscore) => {
                listedHSC.push(<li>{highscore.highscore}</li>)
            })
            setHighscores(listedHSC)
            setMenuHeight(500)
        })
    }
        
    function DropDownItem(props) {
        return (
            <a href="#" 
                className="menu-item" 
                onClick={
                    () => 
                    {
                        props.gotoMenu && setActiveMenu(props.gotoMenu)
                        if(props.submitFunc)
                        {
                            if(props.submitFunc === "login")
                                login()
                            else if(props.submitFunc === "register")
                                register()
                        }
                        if(props.gametype)
                            secondHandler(props.gametype)
                        
                        if(props.game)
                            getHighScore(props.game)
                    }
                }
            >
                <span className="icon-button">{props.leftIcon}</span>

                {props.children}

                <span className="icon-right">{props.rightIcon}</span>
            </a>
        );
    }

    return(
        <div className="dropdown" style={{height: menuHeight}}>
            <CSSTransition in={activeMenu === 'profile'} unmountOnExit timeout={500} classNames="menu-primary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="logIn">Log in</DropDownItem> 
                    <DropDownItem>Log out</DropDownItem>    
                    {/* <DropDownItem gotoMenu="register">Register</DropDownItem>  */}
                </div> 
            </CSSTransition>
            <CSSTransition in={activeMenu === 'logIn'} unmountOnExit timeout={500} classNames="menu-secondary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="profile" leftIcon={<BackArrow />}></DropDownItem>
                    <br />
                    <div className="formTitle">
                        <h2>Log In</h2>
                    </div>
                    <br />
                    <div className="formitem">    
                        <label> Username:</label><br/>
                        <input 
                            type="text"
                            value={username}
                            onChange={e => setUserName(e.target.value)}
                        />
                    </div>
                    <br/>
                    <div className="formitem">
                        <label htmlFor="log-in-password">Password:</label><br/>
                        <input 
                            type="text"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <br/>
                    <DropDownItem gotoMenu="profileMessage" submitFunc="login">
                        <button className="formitem">Submit</button>
                    </DropDownItem>
                </div> 
            </CSSTransition>
            <CSSTransition in={activeMenu === 'register'} unmountOnExit timeout={500} classNames="menu-secondary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="profile" leftIcon={<BackArrow />}></DropDownItem>
                    <br />
                    <div className="formTitle">
                        <h2>Register</h2>
                    </div>
                    <br />
                    <div className="formitem">    
                        <label>Username:</label><br/>
                        <input 
                            type="text"
                            value={regUsername}
                            onChange={e => setRegUserName(e.target.value)}
                        />
                    </div>
                    <br/>
                    <div className="formitem">
                        <label>Password:</label><br/>
                        <input 
                            type="text"
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                        />
                    </div>
                    <br/>
                    <div className="formitem">
                        <label>Re-Enter Password:</label><br/>
                        <input
                            type="text"
                            value={regRePassword}
                            onChange={e => setRegRePassword(e.target.value)}
                        />
                    </div>
                    <br/>
                    <DropDownItem gotoMenu="profileMessage" submitFunc="register">
                        <button className="formitem">Submit</button>
                    </DropDownItem>
                </div> 
            </CSSTransition>
            <CSSTransition in={activeMenu === 'profileMessage'} unmountOnExit timeout={500} classNames="menu-primary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="profile" leftIcon={<BackArrow />}></DropDownItem>
                    <br/>
                    <div className="formitem">{loginMessage}</div>
                </div> 
            </CSSTransition>
            <CSSTransition in={activeMenu === 'help'} unmountOnExit timeout={500} classNames="menu-primary" onEnter={calcHeight}>
                <div className="menu">
                    <div className="formitem" style={{ "text-align": "left"}}>
                        1.) Select game controller Icon<br/>
                        2.) Select Start a game<br/>
                        3.) Pick a Game difficulty <br/>
                        4.) Go to each location as fast as you can!
                    </div>
                </div> 
            </CSSTransition>
            <CSSTransition in={activeMenu === 'game'} unmountOnExit timeout={500} classNames="menu-primary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="gameSelection">Start New game</DropDownItem>
                    <DropDownItem gotoMenu="highscores" game="1 mile">1 mile - highscores</DropDownItem>
                    <DropDownItem gotoMenu="highscores" game="2 mile">2 mile - highscores</DropDownItem>
                    <DropDownItem gotoMenu="highscores" game="5 mile">5 mile - highscores</DropDownItem>
                </div> 
            </CSSTransition>
            <CSSTransition in={activeMenu === 'gameSelection'} unmountOnExit timeout={500} classNames="menu-secondary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="game" leftIcon={<BackArrow />}></DropDownItem>
                    <DropDownItem gametype="1 mile">1 mile game</DropDownItem>
                    <DropDownItem gametype="2 mile">2 mile game</DropDownItem>
                    <DropDownItem gametype="5 mile">5 mile game</DropDownItem>
                    {!isCancelHidden && <DropDownItem gametype="cancel">Cancel Game</DropDownItem>}
                </div> 
            </CSSTransition>
            <CSSTransition ref={highscoreMenu} in={activeMenu === 'highscores'} unmountOnExit timeout={500} classNames="menu-secondary" onEnter={calcHeight}>
                <div className="menu">
                    <DropDownItem gotoMenu="game" leftIcon={<BackArrow />}></DropDownItem>
                    <br/>
                    <ol className="formitem">
                        {highscores}
                    </ol>
                </div> 
            </CSSTransition>
        </div>
    );
}

const headerStyle = {
    background: "#333",
    color: "#fff",
    textAlign: 'center',
    padding: '10px',
    border: '1px solid rgb(197, 182, 182)'
}

export default Header;