const jwt = require("jsonwebtoken")
const { User } = require("../models")

module.exports = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    res.status(401).send({
      errorMessage: "check if token exist",
    })
  }
  const [tokenType, tokenValue] = authorization.split(" ")
  try {
    const { email } = jwt.verify(tokenValue, process.env.JWT_SECRET)
    console.log(tokenValue)
    await User.findOne({
      where: { email },
    }).then((user) => {
      res.locals.user = user
      next()
    })
  } catch (err) {
    console.log(err)
    res.status(401).send({
      errorMessage: "로그인 후 사용하세요.",
    })
  }
}
