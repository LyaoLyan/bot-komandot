const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'bot_komandot',
    'bot_komandot_dev',
    '53AZrLwSce',
    {
        host: 'localhost',
        port: '5433',
        dialect: 'postgres',
        logging: false
    }
)