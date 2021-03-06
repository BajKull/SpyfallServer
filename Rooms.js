const rooms = []
const colors = ["rgb(237, 62, 62)", "rgb(237, 115, 62)", "rgb(224, 140, 61)", "rgb(224, 181, 61)", "rgb(224, 221, 61)", "rgb(191, 224, 61)", "rgb(153, 224, 61)", "rgb(61, 224, 107)", "rgb(61, 224, 156)", "rgb(61, 224, 213)", "rgb(61, 175, 224)", "rgb(61, 121, 224)", "rgb(61, 64, 224)", "rgb(110, 61, 224)", "rgb(148, 61, 224)", "rgb(191, 61, 224)", "rgb(224, 61, 210)", "rgb(224, 61, 172)", "rgb(224, 61, 123)", "rgb(224, 61, 72)"]


const createRoom = (places) => {

  function generateID() {
    let roomID = ''
    for(let i = 0; i < 4; i++) {
      roomID += String.fromCharCode(Math.floor((Math.random() * 25) + 65))
    }
    if(rooms.find(el => el.roomName === roomID) === true)
      generateID()
    else
      return roomID 
  }

  const room = {
    name: generateID(),
    state: "lobby",
    players: [],
    settings: {
      spies: 1,
      time: 7,
      places: places,
    }
  }
  rooms.push(room)

  return { room }
  
}

const joinRoom = ({id, name, room}) => {
  
  const roomValid = rooms.find(el => el.name === room)


  if(roomValid === undefined)
    return { error: "errInvalidCode" }
  if(roomValid.state === "game")
    return { error: "errGameInProgress" }

  const user = { 
    id, 
    name, 
    room, 
    ready: false, 
    promoted: false, 
    color: `${colors[Math.floor(Math.random() * colors.length)]}`
  }

  if(roomValid.players.length === 0)
    user.promoted = true

  roomValid.players.push(user)



  return { user }
}

const getUser = (id) => {
  for(let i = 0; i < rooms.length; i++) {
    const user = rooms[i].players.find(player => player.id === id)
    if(user)
      return user
  }
}

const getUsersInRoom = (roomID) => rooms.find(room => room.name === roomID).players

const userDisconnect = (id) => {
  for(let i = 0; i < rooms.length; i++) {
    const index = rooms[i].players.findIndex(user => user.id === id)
    if(index !== -1) {
      const user = rooms[i].players.splice(index, 1)[0]
      if(rooms[i].players.length === 0){ 
        rooms.splice(i, 1)
        return null
      }
      else 
        rooms[i].players[0].promoted = true;
      return user
    }
  }
}

const userReady = (id, room) => {
  const roomIndex = rooms.findIndex(lobby => lobby.name === room)
  const playerIndex = rooms[roomIndex].players.findIndex(player => player.id === id)
  rooms[roomIndex].players[playerIndex].ready = true
}

const gameStart = (roomID) => {
  // when creating room client sends list of places to the server
  const room = rooms.find(room => room.name === roomID)
  const everyoneReady = room.players.find(user => user.ready === false)
  if(everyoneReady)
    return false
  else {
    if(room.players.length >= 3) {
      if(room.state === "lobby") {
        const place = Math.floor(Math.random() * room.settings.places.length)
        const amountOfRoles = room.settings.places[place]
        const amountOfSpies = room.settings.spies
        const amountOfPlayers = room.players.length
  
        // get amount of roles for given location and give a role to each player
        const data = []
        for(let i = 0; i < amountOfPlayers; i++) {
          const role = Math.floor(Math.random() * amountOfRoles)
          const player = {
            id: room.players[i].id,
            place: place,
            role: role
          }
          data.push(player)
        }
        // randomize spies, -1 equals spy, other numbers are roles
        let i = amountOfSpies
        while(i > 0) {
          const spy = Math.floor(Math.random() * amountOfPlayers)
          if(data[spy].role !== -1) {
            data[spy].role = -1
            i--
          }
        }
  
        return data
      }
      else
        return true
    }
    else
      return false
  }
}

const resetReady = (roomID) => {
  const roomIndex = rooms.findIndex(room => room.name === roomID)
  rooms[roomIndex].players.forEach(player => player.ready = false)
  if(rooms[roomIndex].state === "lobby") 
    rooms[roomIndex].state === "gameRoles"
  else
    rooms[roomIndex].state === "gameTimer"
}

const changeTime = (roomID, amount) => {
  rooms.find(room => room.name === roomID).settings.time += amount
}

const changeSpies = (roomID, amount) => {
  rooms.find(room => room.name === roomID).settings.spies += amount
}

const getSettings = (roomID) => rooms.find(room => room.name === roomID).settings

module.exports =  { createRoom, joinRoom, userDisconnect, getUser, userReady, getUsersInRoom, gameStart, changeTime, changeSpies, getSettings, resetReady }