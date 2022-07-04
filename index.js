const TelegramApi = require('node-telegram-bot-api')
const sequelize = require("./db")
const UserModel = require("./models")
const token = '5580876526:AAFQeKmBlqmXoPC5eZhwRa4vVRTELunTNz4'
const bot = new TelegramApi(token, { polling: true })
// const options = {
//     reply_markup: JSON.stringify({
//         inline_keyboard: [
//             [{ text: 'Добавить ФИО', callback_data: 'name' }],
//             [{ text: 'Добавить телефон', callback_data: 'phone' }],
//             [{ text: 'Добавить почту', callback_data: 'email' }],
//             [{ text: 'Добавить копилку', callback_data: 'kopilka' }],
//         ]
//     })
// }
// const correct_name = {
//     reply_markup: JSON.stringify({
//         inline_keyboard: [
//             [{ text: 'Нет, изменить', callback_data: 'put_name' }],
//             [{ text: 'Да, добавить', callback_data: 'add_name' }],
//         ]
//     })
// }
// const correct_phone = {
//     reply_markup: JSON.stringify({
//         inline_keyboard: [
//             [{ text: 'Нет, изменить', callback_data: 'phone' }],
//             [{ text: 'Да, добавить', callback_data: 'add_phone' }],
//         ]
//     })
// }
const start = async () => {
    const formPhone = (user) => {
        bot.on('message', async msg => {
            const text = msg.text;
            // user.state = 'phone'
            //проверка телефона
            user.phone = text
            await user.save();
            bot.sendMessage(chatId, `Спасибо. Вот ваша анкета: ${user.name} ${user.phone}`)
        })
    }
    const formName = (user) => {
        bot.on('message', async msg => {
            try {
                const text = msg.text;
                user.state = 'name'
                //проверка имени
                user.name = text
                await user.save();

                return bot.sendMessage(chatId, `Теперь введи номер телефона`)

            } catch (e) {
                return bot.sendMessage(chatId, `ОШИБКААААА`)
            }

        })
    }
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (error) {
        console.log('Подключение к бд сломалось', error);
    }

    bot.on('message', async msg => {
        console.log(msg);
        const text = msg.text;
        const chatId = msg.chat.id;
        try {
            const user = await UserModel.findOne({ chatId })
            if (text === '/start') {
                user.state = 'start'
                await user.save()
                return bot.sendMessage(chatId, `Привет! Введи свое ФИО`)
            } else {
                switch (user.state) {
                    case 'start':
                        formName(user)
                        break;
                    case 'name':
                        formPhone(user)
                        break;
                    default:
                        break;
                }
                
            }
            // return bot.sendMessage(chatId, `Я тебя не понимаю, попробуй еще раз`)
        } catch (error) {
            await bot.sendMessage(chatId, "Произошла ошибка! " + error)
        }

        // console.log(newUser.chatId);

        // if (text.indexOf('/name') !== -1) {
        //     const name = text.substr(5)
        //     return bot.sendMessage(newUser.chatId, `Твое имя ${name}. Теперь введи телефон после /phone через пробел. \nПример: /phone 89999999999`)
        // }
        // if (text.indexOf('/phone') !== -1) {
        //     const phone = text.substr(6)
        //     return bot.sendMessage(newUser.chatId, `Твой телефон ${phone}. Спасибо за регистрацию!`)
        // }

    })

}
start()