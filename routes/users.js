const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { Book, User, Rental } = require("../models")
const authMiddleWare = require("../middlewares/auth")

//register
router.post("/register", async (req, res) => {
  try {
    const { email, password, nickname } = req.body
    const hashPassword = bcrypt.hashSync(password, 8)
    await User.create({
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
    const dbEmail = await User.findOne({
      raw: true,
      where: {
        email,
      },
    })
    //check if email match dbEmail
    const emailExist = dbEmail.email
    const hashedPassword = await User.findOne({
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

//get user history
router.get("/users/me/history", authMiddleWare, async (req, res) => {
  try {
    const { id } = res.locals.user
    const query = req.query.isOnGoing
    const user = await User.findOne({
      where: { id },
      raw: true,
    })

    const rentedHistory = await Rental.findAll({
      where: { UserId: user.id },
      raw: true,
      attributes: [
        "rentedBookTitle",
        "createdAt",
        "updatedAt",
        "isReturned",
        "isExtended",
        "dueDate",
        "UserId",
      ],
    })

    rentedHistory.sort((a, b) => b.updatedAt - a.updatedAt)
    const rentHistory = {
      rentedHistory: rentedHistory.map((books) => {
        return {
          books,
        }
      }),
    }
    if (query === "true") {
      res.status(200).json(rentHistory)
    } else if (query === "false") {
      res.status(200).json("something went wrong")
    } else {
      res.status(200).json(rentHistory)
    }
  } catch (err) {
    res.status(400).send(err)
  }
})
//get all user history
router.get("/users/:id/history", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const query = req.query.isOnGoing

    const userHistory = await Rental.findAll({
      where: { UserId: id },
      attributes: [
        "id",
        "rating",
        "dueDate",
        "rentedBookTitle",
        "isReturned",
        "isExtended",
        "UserId",
        "BookId",
      ],
      raw: true,
    })

    userHistory.sort((a, b) => b.updatedAt - a.updatedAt)
    if (query === "true") {
      res.status(200).json(userHistory)
    } else if (query === "false") {
      res.status(200).json("something went wrong")
    } else {
      res.status(200).json(userHistory)
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

module.exports = router
