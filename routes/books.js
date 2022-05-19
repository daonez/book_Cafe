const express = require("express")
const router = express.Router()
const { Book, User } = require("../models")

//get all list of books
router.get("/books", async (req, res) => {
  try {
    const getAllBooks = await Book.findAll({
      attributes: ["title", "author", "description", "rating"],
      raw: true,
    })
    res.status(200).json(getAllBooks)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//get book by id
router.get("/books/:id", async (req, res) => {
  const { id } = req.params

  try {
    const book = await Book.findOne({
      where: { id },
      attributes: ["id", "title", "rating", "isAvailable", "dueDate"],
      raw: true,
    })
    res.status(200).json(book)
  } catch (err) {
    res.status(400).send(err)
  }
})

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
