const rooms = []

const createRoom = ({ admin }) => {

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
    gm: null,
    players: []
  }
  rooms.push(room)

  return { room }
  
}

const joinRoom = ({id, name, room}) => {
  
  const roomValid = rooms.find(el => el.name === room)


  if(roomValid === undefined)
    return { error: "Invalid room code" }
  if(roomValid.state === "game")
    return { error: "Game is already in progress" }

  const user = { id, name, room, ready: false }

  roomValid.players.push(user)

  if(roomValid.players.length === 1)
    roomValid.gm = user.id  

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
    if(index !== -1)
      return rooms[i].players.splice(index, 1)[0]
  }
}

const userReady = (id, room) => {
  const roomIndex = rooms.findIndex(lobby => lobby.roomName === room)
  const playerIndex = rooms[roomIndex].players.findIndex(player => player.id === id)
  rooms[roomIndex].players[playerIndex].ready = true
}

const gameStart = (roomID) => !rooms.room.players.find(user => user.ready === false)

module.exports =  { createRoom, joinRoom, userDisconnect, getUser, userReady, getUsersInRoom, gameStart }