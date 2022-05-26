const express = require("express")
const router = express.Router()
const { Book, User, Rental } = require("../models")
const authMiddleWare = require("../middlewares/auth")

//request to rent a book
router.post("/rentals", authMiddleWare, async (req, res) => {
  try {
    const { bookId } = req.body
    const { id } = res.locals.user

    const user = await User.findOne({ where: { id }, raw: true })
    const book = await Book.findOne({
      where: { id: bookId },
      attributes: ["id", "title", "isAvailable", "dueDate"],
      raw: true,
    })

    //1 is true, 0 is false
    if (book.isAvailable === 1) {
      const date = new Date()
      const dueDate = date.setDate(date.getDate() + 3)
      const bookRented = await Rental.create({
        dueDate,
        rentedBookTitle: book.title,
        isReturned: false,
        UserId: user.id,
        BookId: book.id,
      })
      await Book.update(
        { isAvailable: false, dueDate },
        { where: { id: bookId } },
        { returning: true, plain: true }
      )
      res.status(200).json(bookRented)
    } else {
      res.status(400).json("sorry book is unavailable")
    }
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//edit rented book to be available
router.patch("/rentals/:id", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const { email } = res.locals.user

    const checkUser = await User.findOne({ where: { email } })
    // console.log(checkUser.id)
    const bookRented = await Rental.findOne({ where: { id } })
    // console.log(bookRented.isReturned)
    console.log(bookRented.UserId)

    //0 , 1 doesnt work only false true
    if (bookRented.isReturned === false) {
      const returnBook = await bookRented.update({
        isReturned: true,
        UserId: checkUser.id,
      })
      await Book.update(
        { isAvailable: true },
        { where: { id: bookRented.BookId } },
        { returning: true, plain: true }
      )
      console.log(returnBook)
      res.status(200).json(returnBook)
    } else {
      res.status(400).send("something went wrong")
    }
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})
//edit rented book to extend
router.patch("/rentals/:id/extend", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const { email } = res.locals.user

    const checkUser = await User.findOne({ where: { email } })
    // console.log(checkUser.id)
    const bookRented = await Rental.findOne({
      where: { id },
      attributes: ["id", "isExtended", "dueDate", "BookId"],
    })
    console.log(bookRented.BookId)
    const date = new Date(bookRented.dueDate)
    const date1 = date.setDate(date.getDate() + 3)
    const extendedDate = date + date1
    // const dueDate = extendedDate
    // console.log(dueDate)

    if (bookRented.isExtended === false) {
      const extendBook = await bookRented.update({
        dueDate: extendedDate,
        isExtended: true,
        UserId: checkUser.id,
        BookId: bookRented.BookId,
      })
      await Book.update(
        { isAvailable: false, dueDate: extendedDate },
        { where: { id: bookRented.BookId } },
        { returning: true, plain: true }
      )
      res.status(200).json(extendBook)
    } else {
      res.status(400).send("book can only be extended once")
    }
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

module.exports = router
