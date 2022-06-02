module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      author: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      publishedDate: {
        type: DataTypes.DATE,
      },
      dueDate: {
        type: DataTypes.DATE,
      },
      averageRating: {
        type: DataTypes.DECIMAL(3, 2), //3.25 3숫자 2자리수
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      tableName: "Books", // 테이블 이름
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  )
  Book.associate = (db) => {
    // 유저는 여러 게시글을 작성할 수 있다.
    db.Book.hasMany(db.Rental)
  }

  return Book
}
