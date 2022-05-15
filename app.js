require("dotenv").config()
const express = require("express")
const app = express()

// sql 연결
const { sequelize } = require("./models")
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공")
  })
  .catch((err) => {
    console.error(err)
  })

app.get("/", (req, res) => {
  res.send("hello world")
})

app.listen(3000, () => {
  console.log("server on")
})
