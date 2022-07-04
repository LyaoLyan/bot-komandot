const sequelize = require('./db');
const {DataTypes} = require('sequelize');
const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING, unique: true},
    name: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING, unique: true},
    state: {type: DataTypes.STRING}
})

module.exports = User;