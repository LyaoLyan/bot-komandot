exports.test = () => {
    console.log('Hello world');
};


const { Op } = require("sequelize")

const ValidateModule = require('../helpers/validate.module')
const UserModel = require("../models/user.model")


/* #region  Admin function */
exports.calculate11 = async (bot, user, chatId, msg) => {
    var t = msg.text;

    await bot.sendMessage(chatId, `Пожалуйста, подождите. Это может занять какое-то время`);

    if (ValidateModule.checkDate(t)) return bot.sendMessage(chatId, `Неправильно введена дата, убедитесь что дата в формате "01 02 2022"`);

    const { startOfDay, endOfDay } = getEdgesOfDay(msg.text);

    const usersRaw = await UserModel.findAll({
        where: {
            createdAt: {
                [Op.lt]: `${endOfDay.toISOString()}`,
                [Op.gt]: `${startOfDay.toISOString()}`
            }
        },
    });

    let usersStrings = usersRaw.map(item => {
        const { id, name, phone } = item;
        return `${id} | ${name} ${phone}`;
    });

    return await bot.sendMessage(chatId, usersStrings.join('\n'));
};

exports.calculate12 = async (bot, user, chatId, msg) => {
    try {
        const client = await UserModel.findOne({ where: { phone: msg.text } });
        const file = `image/jpg;base64,${client.image}`;
        const fileOpts = {
            filename: 'image',
            contentType: 'image/jpg',
        };
        bot.sendMessage(chatId, `id: ${user.id} name: ${user.name} phone: ${user.phone}`);
        return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
    } catch {
        return bot.sendMessage(chatId, `Что-то пошло не так. Ты уверен, что корректно ввел телефон?`);
    }
};

exports.calculate13 = async (bot, user, chatId, msg) => {
    try {
        const client = await UserModel.findOne({
            where: {
                id: Number(msg.text)
            }
        });
        const file = `image/jpg;base64,${client.image}`;
        const fileOpts = {
            filename: 'image',
            contentType: 'image/jpg',
        };

        bot.sendMessage(chatId, `id: ${user.id} name: ${user.name} phone: ${user.phone} `);
        return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
        // bot.sendMessage(chatId, `data:image/jpg;base64,${client.image}`)
    } catch (err) {
        console.log(err.message);
        return bot.sendMessage(chatId, `Что-то пошло не так. Ты уверен, что корректно ввел ID?`);
    }

};
/* #endregion */

const getEdgesOfDay = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
};
