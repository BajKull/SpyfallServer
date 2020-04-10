const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')

const { createRoom, joinRoom, userDisconnect, getUser, userReady, gameStart, getUsersInRoom } = require('./Rooms.js')

const router = require("./router.js")
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(cors())
app.use(router)

io.on('connection', (socket) => {

  socket.on('createRoom', ({ admin }, callback) => {
    const { error, room } = createRoom({ admin })
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
    socket.broadcast.to(user.room).emit('message', { message: `${user.name} has joined.`})
    io.to(user.room).emit('setUserList', users)

    callback()
  })

  socket.on('disconnect', () => {
    const user = userDisconnect(socket.id)

    if(user) {
      const users = getUsersInRoom(user.room)
      io.to(user.room).emit('setUserList', users)
      io.to(user.room).emit('message', { message: `${user.name} has left.`})
    }
  })

  socket.on('playerReady', () => {
    const user = getUser(socket.id)

    userReady(user.id, user.room)
    io.to(user.room).emit('ready', user.id)

  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('message', { user: user.name, message:message, color: user.color})

    callback()
  })


})

server.listen(process.env.PORT || 5000, () => console.log("server running"))