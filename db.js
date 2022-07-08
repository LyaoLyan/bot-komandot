const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'bot_komandot',
    'root',
    'root',
    {
        host: '109.71.13.150',
        port: '6432',
        dialect: 'postgres',
        sync: true 
    }
)