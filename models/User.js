module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // 스키마 정의
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(100),
        // 이메일 체크
        validate: {
          isEmail: true,
        },
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      charset: "utf8", // 한국어 설정
      collate: "utf8_general_ci", // 한국어 설정
      tableName: "User", // 테이블 이름
      timestamps: true, // createAt & updateAt 활성화
      paranoid: true, // timestamps 가 활성화 되어야 사용 가능 > deleteAt 옵션 on
    }
  )

  User.associate = (db) => {
    // 유저는 여러 게시글을 작성할 수 있다.
    db.User.hasMany(db.Book, {
      foreignKey: {
        name: "id",
        allowNull: false,
      },
      onDelete: "cascade",
    })
  }
  return User
}
