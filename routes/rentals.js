const express = require("express")
const router = express.Router()
const { Book, User, Rental, sequelize } = require("../models")

//request to rent a book
router.post("/rentals", async (req, res) => {
  try {
    const { title } = req.body
    const findBookTitle = await Book.findOne({ where: { title }, raw: true })

    const rentedBookTitle = findBookTitle.title

    const bookRented = await Rental.create({
      rentedBookTitle,
      raw: true,
    })
    res.status(200).json(bookRented)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//edit rented book to be available

//edit rented book to extend

module.exports = router
