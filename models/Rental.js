module.exports = (sequelize, DataTypes) => {
  const Rental = sequelize.define(
    "Rental",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      rating: {
        type: DataTypes.BIGINT,
      },
      dueDate: {
        type: DataTypes.DATE,
      },
      rentedBookTitle: {
        type: DataTypes.STRING(100),
      },
      isReturned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      tableName: "Rentals", // 테이블 이름
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  )
  Rental.associate = (db) => {
    db.Rental.belongsTo(db.Book)
    db.Rental.belongsTo(db.User)
  }

  return Rental
}
