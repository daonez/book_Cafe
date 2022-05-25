const express = require("express")
const router = express.Router()
const { Book, User, Rental } = require("../models")
const authMiddleWare = require("../middlewares/auth")

//request to rent a book
router.post("/rentals", authMiddleWare, async (req, res) => {
  try {
    const { title } = req.body
    const { id } = res.locals.user

    const userId = await User.findOne({ where: { id }, raw: true })
    console.log(userId.id)
    const findBookTitle = await Book.findOne({ where: { title }, raw: true })

    const rentedBookTitle = findBookTitle.title
    const date = new Date()
    const dueDate = date.setDate(date.getDate() + 3)

    const bookRented = await Rental.create({
      dueDate,
      rentedBookTitle,
      return: false,
      UserId: userId.id,
    })
    res.status(200).json(bookRented)
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
    console.log(findBookToReturn)
    const date = new Date()
    const dueDate = date.setDate(date.getDate())
    const returnBook = await findBookToReturn.update(
      {
        dueDate,
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
router.patch('/rentals/:id/extend')

module.exports = router
