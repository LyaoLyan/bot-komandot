const TelegramApi = require('node-telegram-bot-api')

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

class User {
    name;
    chatId;
    phone;
    constructor(chatId, name, phone) {
        this.chatId = chatId;
        this.name = name;
        this.phone = phone;
    }
    get name() {
        return this.name
    }
    set name(name) {
        this.name = name
    }
    set chatId(chatId) {
        this.chatId = chatId
    }
    get phone() {
        return this.phone
    }
    set phone(phone) {
        this.phone = phone
    }
    get form() {
        return `${this.name} ${this.phone}`
    }
}
let newUser = new User();
const formPhone = (chatId) => {
    bot.on('message', async msg => {
        formPhone();
        return bot.sendMessage(chatId, `Спасибо. Вот ваша анкета: ${newUser.form}`)
    })
}
const formName = (chatId) => {
    bot.on('message', async msg => {
        formPhone(chatId);
        return bot.sendMessage(chatId, `Теперь введи номер телефона`)
    })
}
const start = () => {
    bot.on('message', async msg => {
        newUser.chatId = msg.chat.id;
        // console.log(newUser.chatId);
        if (text === '/start') {
            formName(newUser.chatId);
            return bot.sendMessage(newUser.chatId, `Привет! Введи свое ФИО`)
        }
        // if (text.indexOf('/name') !== -1) {
        //     const name = text.substr(5)
        //     return bot.sendMessage(newUser.chatId, `Твое имя ${name}. Теперь введи телефон после /phone через пробел. \nПример: /phone 89999999999`)
        // }
        // if (text.indexOf('/phone') !== -1) {
        //     const phone = text.substr(6)
        //     return bot.sendMessage(newUser.chatId, `Твой телефон ${phone}. Спасибо за регистрацию!`)
        // }
        // return bot.sendMessage(newUser.chatId(), `Я тебя не понимаю, попробуй еще раз`)
    })


}
start()