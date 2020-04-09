const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.send({ response: "server running"}).status(200)
}) 

module.exports = router