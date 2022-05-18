const express = require("express")
const router = express.Router()
const { Book, User } = require("../models")

//get all list of books

//get book by id

//create new book
router.post("/books/new", async (req, res) => {
  const { title, author, description } = req.body
  try {
    const createBook = await Book.create({
      title,
      author,
      description,
    })
    res.status(201).json(createBook)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//edit a book

//delete a book

module.exports = router
