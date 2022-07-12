const fetch = require('node-fetch');
const TelegramApi = require('node-telegram-bot-api')
const sequelize = require("./db")
const UserModel = require("./models")
const token = '5580876526:AAFQeKmBlqmXoPC5eZhwRa4vVRTELunTNz4'
const bot = new TelegramApi(token, { polling: true })
const fs = require('fs')
var http = require("https");



// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

const start = async () => {
    const checkDate = (itemElem) => {
        return (/[a-zа-яё]/.test(itemElem) || itemElem.length > 10 || itemElem.length < 8)
    }

    const checkPhone = (itemElem) => {
        return (/[a-zа-яё]/.test(itemElem) || itemElem.length != 11)
    }
    const checkName = (itemElem) => {
        return /\d/.test(itemElem);
    }

    bot.on('message', async msg => {
        // await sequelize.sync({force: true}) 
        // await UserModel.drop()
        const text = msg.text;
        const chatId = msg.chat.id;
        // let user;
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
                await user.save();
                return bot.sendMessage(chatId, `Приветствуем Вас на борту 🚢 корабля "Командор"! 👋 Зарегистрируйтесь в чат-боте за 10 секунд и получите 100 БАЛЛОВ❗️ на карту "Копилка". Приступим! 🔥⬇️\n1️⃣ Введите Ваше ФИО`)

            } else if (text === '/profile') {
                const date = new Date(user.updatedAt)
                return bot.sendMessage(chatId, `Ваш профиль\nID: ${user.id}\nФИО: ${user.name}\nТелефон: ${user.phone}`)
            } else if (text === 'D4%d87k}vLGG') {
                user.admin = true
                user.state = 11
                await user.save()
                return bot.sendMessage(chatId, `Напишите дату, в которой вы хотите посмотреть зарегистрированных пользователей в формате "1 2 2022", где 1 - день месяца, 2 - месяц, 2022 - год`)
            } else if (user.admin && user.state === 11) { 
                bot.sendMessage(chatId, `Пожалуйста, подождите. Это может занять какое-то время`)
                if(checkDate(text)) return bot.sendMessage(chatId, `Неправильно введена дата, убедитесь что дата в формате "1 2 2022"`)
                var day = text.slice(0, 1);
                var month = text.slice(2, 3)
                var year = text.slice(-4);
                user.state = 12
                await user.save()
                const below = new Date(year, month-1, day);
                const above = new Date(year, month-1, day+1);
                const users = await UserModel.findAll({
                    where: { updatedAt: {[sequelize.between] : [below, above]} },
                });
                let list;
                users.forEach((us) => {
                    list += `${us.id} ${us.name} ${us.phone}\n`
                  });
                return sendMessage(chatId, `${list}`)
            } else if (user.admin && text === '/search_phone') {
                user.state = 12
                await user.save()
                return bot.sendMessage(chatId, `Напишите  телефон в формате "89999999999"`)

            } else if (user.admin && user.state === 12) {
                const client = await UserModel.findOne({ where: { phone: text } });
                //а если не найдет?
                return bot.sendMessage(chatId, `id:${user.id}\nname:${user.name}\nphone:${user.phone}`)
            } else if (user.admin && text === '/search_id') {
                user.state = 13
                await user.save()
                return bot.sendMessage(chatId, `Напишите  id`)
            } else if (user.admin && user.state === 13) {
                const client = await UserModel.findOne({ where: { id: text } });
                //а если не найдет?
                return bot.sendMessage(chatId, `id:${user.id} name:${user.name} phone:${user.phone} `)
            } else if (user.state === 0) {
                const text = msg.text;
                if (checkName(text)) {
                    return bot.sendMessage(chatId, `Упс! Кажется, ФИО с ошибкой... попробуйте ввести снова 😉. Номер нужно ввести без +7 в начале в формате "89999999999"`)
                } else {
                    user.state = 1
                    user.name = text
                    await user.save();
                    return bot.sendMessage(chatId, `2️⃣ Введите номер телефона, который привязан к карте "Копилка", в формате "89999999999"`)
                }


            } else if (user.state === 1) {
                const text = msg.text;
                if (checkPhone(text)) {
                    return bot.sendMessage(chatId, `Вы ввели номер с ошибкой, напишите ещё раз! 😊`)
                } else {
                    user.state = 2
                    user.phone = text
                    await user.save();
                    return bot.sendMessage(chatId, `Прикрепите фото`)
                    // return bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`)

                }
            } else if (user.state === 2) {
                // console.log(msg)
                user.state = 3
                // base64_encode(
                // const url = `https://api.telegram.org/bot${token}/getFile?file_id=${msg.photo[2].file_id}`
                const response = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${msg.photo[2].file_id}`);
                const data = await response.json();
                const path = data.result.file_path
                // download(`https://api.telegram.org/bot${token}/${path}`, 'file.jpg')
                const file = fs.createWriteStream("file.jpg");
                const request = http.get(`https://api.telegram.org/bot${token}/${path}`, function (response) {
                    response.pipe(file);
                });

                user.paycheck = base64_encode('file.jpg')
                await user.save();
                return bot.sendMessage(chatId, `${user.paycheck}`)
                // await bot.sendMessage(chatId, `Не беспокойтесь! Ваши баллы уже в пути 😁 Если хотите, мы можем записать анкету заново.\nДля этого введите ⬇️\n/start`)
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