const jwt = require("jsonwebtoken")
const { User } = require("../models")

module.exports = async (req, res, next) => {
  const { authorization } = req.headers
  const [tokenType, tokenValue] = authorization.split(" ")

  try {
    if (tokenType !== "Bearer") {
      res.status(401).send({
        errorMessage: "로그인 후 사용하세요.",
      })
      return
    } else {
      const { email } = jwt.verify(tokenValue, process.env.JWT_SECRET)

      await User.findOne({
        where: { email },
      }).then((user) => {
        res.locals.user = user
        next()
      })
    }
  } catch (err) {
    console.log(err)
    res.status(401).send({
      errorMessage: "로그인 후 사용하세요.",
    })
  }
}
