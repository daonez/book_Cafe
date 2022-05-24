const { DB_LOCAL_PASSWORD, DB_LOCAL_IP } = process.env

module.exports = {
  development: {
    username: "root",
    password: DB_LOCAL_PASSWORD,
    database: "book_cafe",
    host: DB_LOCAL_IP,
    dialect: "mysql",
    camelCase: true,
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
}
