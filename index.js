const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')

const { createRoom, joinRoom, userDisconnect, getUser, userReady, gameStart, getUsersInRoom, changeSpies, changeTime, getSettings, resetReady } = require('./Rooms.js')

const router = require("./router.js")
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(cors())
app.use(router)

io.on('connection', (socket) => {

  socket.on('createRoom', (places, callback) => {
    const { error, room } = createRoom(places)
    if(error)
      return callback(error)

    console.log(`Room ${room.name} created`)

    callback(null, room.name)
  })

  socket.on('joinRoom', ({ name, room }, callback) => {
    room = room.toUpperCase()
    const { error, user } = joinRoom({ id: socket.id, name, room })

    if(error) 
      return callback(error)
    
      
    console.log(`${user.name} joined room ${user.room}`)

    socket.join(user.room)

    const users = getUsersInRoom(user.room)

    socket.emit('message', { message: `Welcome ${user.name}! Room code: ${user.room}`})
    socket.emit('settings', getSettings(room))
    socket.broadcast.to(user.room).emit('message', { message: `${user.name} has joined.`})
    io.to(user.room).emit('setUserList', users)

    callback()
  })

  socket.on('disconnect', () => {
    const user = userDisconnect(socket.id)

    if(user) {
      console.log(`${user.name} disconnected from room ${user.room}`)
      const users = getUsersInRoom(user.room)
      io.to(user.room).emit('setUserList', users)
      io.to(user.room).emit('message', { message: `${user.name} has left.`})
    }
    else
      socket.emit('abort')
  })

  socket.on('playerReady', () => {
    const user = getUser(socket.id)
    if(user) {
      userReady(user.id, user.room)
      io.to(user.room).emit('ready', user.id)
      const info = gameStart(user.room)
      if(info === true) {
        io.to(user.room).emit('start')
        resetReady(user.room)
      }
      else if (info !== false) {
        info.forEach(data => io.to(data.id).emit('start', {place: data.place, role: data.role}))
        resetReady(user.room)
      }
    }
    else 
      socket.emit('abort')
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)


    if(user.room !== null)
      io.to(user.room).emit('message', { user: user.name, message:message, color: user.color})
      
    callback()
  })

  socket.on('changeTime', (amount, callback) => {
    const user = getUser(socket.id)
    if(user) {
      changeTime(user.room, amount)
      io.to(user.room).emit('updateTime', amount)
    }
    else 
      socket.emit('abort')
    callback()
  })

  socket.on('changeSpies', (amount, callback) => {
    const user = getUser(socket.id)
    if(user) {
      changeSpies(user.room, amount)
      io.to(user.room).emit('updateSpies', amount)
    }
    else 
      socket.emit('abort')
    callback()
  })


})

server.listen(process.env.PORT || 5000, () => console.log("server running"))