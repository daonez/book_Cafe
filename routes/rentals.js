const express = require("express")
const router = express.Router()
const { Book, User, Rental } = require("../models")
const authMiddleWare = require("../middlewares/auth")

//get all list of rentals
router.get("/rentals", async (req, res) => {
  try {
    const user = await User.findAll({
      raw: true,
    })

    //find all rentals
    const allRentals = await Rental.findAll({
      attributes: ["id", "rating", "dueDate", "rentedBookTitle", "isReturned", "UserId"],
      raw: true,
      include: [
        { model: Book, attributes: ["averageRating"] },
        { model: User, attributes: ["nickname"] },
      ],
    })
    //most recent rented book
    allRentals.sort((a, b) => b.createdAt - a.createdAt)

    const mapRentals = {
      rentals: allRentals.map((rents) => {
        return {
          rents,
        }
      }),
    }

    res.status(200).json(mapRentals)
  } catch (err) {
    res.status(400).send(err)
  }
})

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
      let dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 3)
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
    res.status(400).send(err)
  }
})

//edit rented book to be available
router.patch("/rentals/:id", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const { email } = res.locals.user

    const user = await User.findOne({ where: { email } })

    const bookRented = await Rental.findOne({ where: { id } })

    //0 , 1 doesnt work only false true
    if (bookRented.isReturned === false) {
      const returnBook = await bookRented.update({
        isReturned: true,
        UserId: user.id,
      })
      await Book.update(
        { isAvailable: true },
        { where: { id: bookRented.BookId } },
        { returning: true, plain: true }
      )

      res.status(200).json(returnBook)
    } else {
      res.status(400).send("something went wrong")
    }
  } catch (error) {
    res.status(400).send(error)
  }
})
//edit rented book to extend
router.patch("/rentals/:id/extend", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const { email } = res.locals.user

    const user = await User.findOne({ where: { email } })

    const bookRented = await Rental.findOne({
      where: { id },
      attributes: ["id", "isExtended", "dueDate", "BookId"],
    })

    let date = new Date(bookRented.dueDate)
    date.setDate(date.getDate() + 3)

    if (bookRented.isExtended === false) {
      const extendBook = await bookRented.update({
        dueDate: date,
        isExtended: true,
        UserId: user.id,
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
    res.status(400).send(error)
  }
})

//rate a book when returned
router.post("/rentals/:id/rate", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params
    const { email } = res.locals.user
    //rating =5
    const { rating } = req.body
    const user = await User.findOne({ where: { email } })
    const bookRented = await Rental.findOne({
      where: { id },
      attributes: ["id", "rating", "isExtended", "dueDate", "BookId"],
    })

    if (rating >= 0 && rating <= 5) {
      await bookRented.update({
        rating,
      })
    } else {
      res.send("sorry rating is only from 0 to 5")
    }

    //get average numbers for book
    const ratingArray = await Rental.findAll({
      where: { BookId: bookRented.BookId },
      attributes: ["rating"],
      raw: true,
    })

    const numbers = ratingArray.map((rates) => rates.rating)
    //1,5
    const filterNum = numbers.filter(Number)

    const arrLength = filterNum.length

    const reduceNum = filterNum.reduce((partialSum, a) => partialSum + a, 0)
    const averageNum = reduceNum / arrLength
    console.log(averageNum)
    //range 0~5 only

    await Book.update(
      { averageRating: averageNum },
      { where: { id: bookRented.BookId } },
      { returning: true, plain: true }
    )
    res.status(200).json("book rated")
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

module.exports = router
