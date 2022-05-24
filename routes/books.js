const express = require("express")
const router = express.Router()
const { Book, User } = require("../models")
const authMiddleWare = require("../middlewares/auth")

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
router.patch("/books/:id", async (req, res) => {
  const { id } = req.params
  const { title, author, description, rating, isAvailable } = req.body
  try {
    const findBook = await Book.findOne({ where: { id } })
    const editBook = await findBook.update(
      {
        title,
        author,
        description,
        rating,
        isAvailable,
      },
      { returning: true, plain: true }
    )
    res.status(200).json(editBook)
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

//delete a book
router.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params
    //for clean code find first id then delete
    const findBook = await Book.findOne({ where: { id } })
    const deleteBook = await findBook.destroy({
      where: {
        id,
      },
    })
    //if not auth user return 403(forbidden)
    if (!deleteBook) {
      return res.status(403).send("you don't have access")
    }
    return res.status(200).send("book deleted")
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
