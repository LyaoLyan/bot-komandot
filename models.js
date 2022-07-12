const sequelize = require('./db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true },
  admin: {type: DataTypes.BOOLEAN, defaultValue: false},
  chatId: { type: DataTypes.STRING, unique: true },
  state: { type: DataTypes.INTEGER },
  paycheck: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, unique: true },
  image: { type: DataTypes.STRING(1234) }
},
  {
    tableName: 'users',
  });

module.exports = User