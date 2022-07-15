exports.test = () => {
    console.log('Hello world');
};


const { Op } = require("sequelize")

const ValidateModule = require('../helpers/validate.module')
const UserModel = require("../models/user.model")


/* #region  Admin function */
exports.calculate11 = async (bot, user, chatId, msg) => {
    var t = msg.text;



    if (ValidateModule.checkDate(t)) return bot.sendMessage(chatId, `Проверьте, правильно ли Вы написали дату. Нужный формат: 2022-01-02, где 2022 - год, 01 - месяц, 02 – день.`);
    await bot.sendMessage(chatId, `Пожалуйста, подождите. Это может занять какое-то время`);
    const { startOfDay, endOfDay } = getEdgesOfDay(msg.text);

    const usersRaw = await UserModel.findAll({
        where: {
            createdAt: {
                [Op.lt]: `${endOfDay.toISOString()}`,
                [Op.gt]: `${startOfDay.toISOString()}`
            }
        },
    });
    // const client = await UserModel.findOne({ where: { phone: msg.text } });

    let max = usersRaw[0].id;
    let min = max;
    usersRaw.forEach(client => {
        if (Number(client.id) > max) max = Number(client.id);
        if (Number(client.id) < min) min = Number(client.id);

    });
    return await bot.sendMessage(chatId, `ID пользователей, зарегистрировавшихся ${t}: \n${min} - ${max}`);

    // let usersStrings = usersRaw.map(item => {
    //     const { id, name, phone } = item;
    //     return `${id} | ${name} ${phone}`;
    // });

    // return await bot.sendMessage(chatId, usersStrings.join('\n'));
};

exports.calculate12 = async (bot, user, chatId, msg) => {
    try {
        const client = await UserModel.findOne({ where: { phone: msg.text } });
        const file = `image/jpg;base64,${client.image}`;
        const fileOpts = {
            filename: 'image',
            contentType: 'image/jpg',
        };
        bot.sendMessage(chatId, `${client.id} | ${client.name} ${client.phone}`);
        return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
    } catch (err) {
        if (err == "TypeError: Cannot read properties of null (reading 'image')") {
            return bot.sendMessage(chatId, `По этому номеру телефона нет зарегистрированных пользователей. Проверьте, правильно ли указан номер телефона и введите еще раз.`);
        } else {
            return bot.sendMessage(chatId, `Непонятная ошибка, обратитесь в тех. поддержку`);
        }
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

        bot.sendMessage(chatId, `${client.id} | ${client.name} ${client.phone} `);
        return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
        // bot.sendMessage(chatId, `data:image/jpg;base64,${client.image}`)
    } catch (err) {
        if (err == "TypeError: Cannot read properties of null (reading 'image')") {
            return bot.sendMessage(chatId, `По этому ID нет зарегистрированных пользователей. Проверьте правильно ли указан ID и введите еще раз.`);
        } else {
            return bot.sendMessage(chatId, `Непонятная ошибка, обратитесь в тех. поддержку`);
        }
    }

};
exports.calculate14 = async (bot, user, chatId, msg) => {
    try {
        let command = msg.text.split(' / ')
        var ids = command[0].split(' ');
        var message = command[1]
        let u;
        for (let i = 0; i < ids.length; i++) {
            u = await UserModel.findOne({
                where: {
                    id: Number(ids[i])
                }
            })



            await bot.sendMessage(u.chatId, `${message}`)
            await bot.sendMessage(chatId, `Сообщение пользователю ${ids[i]} успешно доставлено!`)
        }
        return
    } catch (error) {
        if (error == `SequelizeDatabaseError: column "nan" does not exist"`) {
            return await bot.sendMessage(chatId, "Неправильно введены данные. Убедитесь, что вы ввели команду id и сообщение в таком формате:\n12 8 4 2 6 / Привет!")
        } else {
            return bot.sendMessage(chatId, "Произошла какая-то ошибка! Убедитесь в введенной команде. Она должна быть в такой форме: \n12 8 4 2 6 / Привет!\nЕсли команда написана верно, значит обратитесь в тех. поддержку")
        }
    }
}
/* #endregion */

const getEdgesOfDay = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
};
