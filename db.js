const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    //смотри 26:40
    'bot_komandot',
    'root',
    'root',
    {
        host: '109.71.13.150',
        port: '6432',
        dialect: 'postgres'
    }
)