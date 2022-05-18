const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const db = require("../models")

//register
router.post("/register", async (req, res) => {
  try {
    const { email, password, nickname } = req.body
    const hashPassword = bcrypt.hashSync(password, 8)
    await db.User.create({
      email,
      password: hashPassword,
      nickname,
    })
    res.status(200).json({
      msg: "register success",
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({
      errorMessage: "something went wrong",
    })
  }
})

//login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    //find email in db
    const dbEmail = await db.User.findOne({
      raw: true,
      where: {
        email,
      },
    })
    //check if email match dbEmail
    const emailExist = dbEmail.email
    const hashedPassword = await db.User.findOne({
      raw: true,
      where: {
        email,
      },
    })
    const checkPassword = bcrypt.compareSync(password, hashedPassword.password)
    //create token
    const token = jwt.sign({ email: emailExist }, process.env.JWT_SECRET)
    if (emailExist === email && checkPassword === true) {
      return res.status(200).json({
        token,
        msg: "login success",
      })
    }
  } catch (err) {
    res.status(400).json({
      msg: "login fail",
    })
  }
})

module.exports = router
