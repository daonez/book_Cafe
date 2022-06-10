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
    const { onGoing } = req.query
    const user = await User.findOne({
      where: { id },
      raw: true,
    })
    if (onGoing === "false") {
      const returnedBooks = await Rental.findAll({
        where: { isReturned: true },
        raw: true,
        attributes: [
          "id",
          "rentedBookTitle",
          "createdAt",
          "updatedAt",
          "isReturned",
          "isExtended",
          "dueDate",
          "BookId",
        ],
      })
      res.status(200).json(returnedBooks)
    } else if (onGoing === "true") {
      const notReturned = await Rental.findAll({
        where: { isReturned: false },
        raw: true,
        attributes: [
          "id",
          "rentedBookTitle",
          "createdAt",
          "updatedAt",
          "isReturned",
          "isExtended",
          "dueDate",
          "BookId",
        ],
      })
      res.status(200).json(notReturned)
    } else {
      const rentedHistory = await Rental.findAll({
        where: { UserId: user.id },
        raw: true,
        attributes: [
          "id",
          "rentedBookTitle",
          "createdAt",
          "updatedAt",
          "isReturned",
          "isExtended",
          "dueDate",
          "BookId",
        ],
      })

      rentedHistory.sort((a, b) => b.updatedAt - a.updatedAt)
      res.status(200).json(rentedHistory)
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})
//get all user history
router.get("/users/:id/history", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const { onGoing } = req.query

    if (onGoing === "true") {
      const notReturned = await Rental.findAll({
        where: { isReturned: false, UserId: id },
        raw: true,
        attributes: [
          "id",
          "rentedBookTitle",
          "createdAt",
          "updatedAt",
          "isReturned",
          "isExtended",
          "dueDate",
          "BookId",
          "UserId",
        ],
      })
      res.status(200).json(notReturned)
    } else if (onGoing === "false") {
      const returnedBooks = await Rental.findAll({
        where: { isReturned: true, UserId: id },
        raw: true,
        attributes: [
          "id",
          "rentedBookTitle",
          "createdAt",
          "updatedAt",
          "isReturned",
          "isExtended",
          "dueDate",
          "BookId",
        ],
      })
      res.status(200).json(returnedBooks)
    } else {
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
      res.status(200).json(userHistory)
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

module.exports = router
