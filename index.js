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

    const checkPhone = (itemElem) => {
        // let checkCount = 0;
        // if (itemElem[0] == "+" && itemElem.length == 12) {
        //     checkCount = 1
        // } else if (itemElem.length == 11) {
        //     checkCount = 1
        // }
        return /[a-zа-яё]/.test(itemElem)
    }
    const checkName = (itemElem) => {
        return /\d/.test(itemElem);
    }


    bot.on('message', async msg => {
        // await UserModel.drop()
        const text = msg.text;
        const chatId = msg.chat.id;
        try {
            await sequelize.authenticate()
            await sequelize.sync()
        } catch (error) {
            return bot.sendMessage(chatId, `Извините, у нас ведутся технические работы. Пожалуйста, зайдите чуть позже 😌`)
        }
        try {
            const user = await UserModel.findOne({ chatId })
            if (text === '/start') {
                user.state = 0
                    user.phone = text
                    await user.save()
                    return bot.sendMessage(chatId, `Приветствуем Вас на борту 🚢 корабля "Командор"! 👋 Зарегистрируйтесь в чат-боте за 10 секунд и получите 100 БАЛЛОВ❗️ на карту "Копилка". Приступим! 🔥⬇️\n1️⃣ Введите Ваше ФИО`)

            } else if (user.state == 0) {
                const text = msg.text;
                if (checkName(text)) {
                    return bot.sendMessage(chatId, `Упс! Кажется, ФИО с ошибкой... попробуйте ввести снова 😉`)
                } else {
                    user.state = 1
                    user.name = text
                    await user.save();
                    return bot.sendMessage(chatId, `2️⃣ Введите номер телефона, который привязан к карте "Копилка"`)
                }


            } else if (user.state == 1) {
                const text = msg.text;
                if (checkPhone(text)) {
                    return bot.sendMessage(chatId, `Вы ввели номер с ошибкой, напишите ещё раз! 😊`)
                } else {
                    user.state = 2
                    user.phone = text
                    await user.save();
                    return bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`)
    
                }
                // user.state = 'phone'
                //проверка телефона
                

            } else if (user.state == 2) {
                await bot.sendMessage(chatId, `Не беспокойтесь! Ваши баллы уже в пути 😁 Если хотите, мы можем записать анкету заново.\nДля этого введите ⬇️\n/start`)
            }

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