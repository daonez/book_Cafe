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
      attributes: ["id", "title", "isAvailable"],
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
        { isAvailable: false },
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
router.patch("/rentals/:id", async (req, res) => {
  try {
    const { id } = req.params
    const findBookToReturn = await Rental.findOne({ where: { id } })

    const returnBook = await findBookToReturn.update(
      {
        return: true,
      },
      { returning: true, plain: true }
    )
    res.status(200).json(returnBook)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})
//edit rented book to extend
router.patch("/rentals/:id/extend")

module.exports = router
