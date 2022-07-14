const TelegramApi = require('node-telegram-bot-api')
const sequelize = require("./db")
const UserModel = require("./models/user.model")
const token = '5580876526:AAFQeKmBlqmXoPC5eZhwRa4vVRTELunTNz4'
const bot = new TelegramApi(token, { polling: true })

const AdminModule = require('./modules/admin.module')
const UserModule = require('./modules/user.module')


// function to encode file data to base64 encoded string






const start = async () => {


    await AdminModule.test()

    bot.on('message', async msg => {

        const text = msg.text
        const chatId = msg.chat.id

        try {
            await sequelize.authenticate()
            await sequelize.sync()
        } catch (error) {
            return bot.sendMessage(chatId, `Извините, у нас ведутся технические работы. Пожалуйста, зайдите чуть позже 😌`)
        }



        try {

            await checkUserInDb({ chatId })

            const user = await UserModel.findOne({ chatId })

            switch (text) {
                case '/start': {
                    await startFunc(user, chatId, msg)
                }
                    break
                case '/profile': {
                    await profileFunc(user, chatId, msg)
                }
                    break
                case 'D4%d87k}vLGG': {
                    await becomeAdmin(user, chatId, msg)
                }
                    break
                case '/search_by_date': {
                    await searchByDate(user, chatId, msg)
                }
                    break
                case '/search_phone': {
                    if (!user.admin) {
                        return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08')
                    }
                    await searchPhone(user, chatId, msg)
                }
                    break
                case '/search_id': {
                    if (!user.admin) {
                        return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08')
                    }
                    await searchId(user, chatId, msg)
                }
                    break

                default: {

                    await defaultFunc(user, chatId, msg)
                }
                    break
            }

        } catch (error) {
            console.log(error)
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





/* #region  Helper function */
const checkUserInDb = async ({ chatId }) => {
    let test = await UserModel.count({ chatId })

    console.log(Boolean(test))

    if (!Boolean(test)) {
        await UserModel.create({ chatId })
    }

}

const startFunc = async (user, chatId, msg) => {
    user.state = 0
    await user.save()
    return bot.sendMessage(chatId, `Приветствуем Вас на борту 🚢 корабля "Командор"! 👋 Зарегистрируйтесь в чат-боте за 10 секунд и получите 100 БАЛЛОВ❗️ на карту "Копилка". Приступим! 🔥⬇️\n1️⃣ Введите Ваше ФИО`)

}


const profileFunc = async (user, chatId, msg) => {
    const file = `image/jpg;base64,${user.image}`;
    const fileOpts = {
        filename: 'image',
        contentType: 'image/jpg',
    };
    bot.sendMessage(chatId, `Ваш профиль\nID: ${user.id}\nФИО: ${user.name}\nТелефон: ${user.phone}`)
    return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
}

const becomeAdmin = async (user, chatId, msg) => {
    user.admin = true
    await user.save()
    return bot.sendMessage(chatId, `/search_by_date - Поиск всех пользователей по дате добавления\n/search_phone - Поиск пользователя по телефону\n/search_id - Поиск пользователя по ID`)
}

const searchByDate = async (user, chatId, msg) => {
    user.state = 11
    await user.save()
    return bot.sendMessage(chatId, `Напишите дату, в которой вы хотите посмотреть зарегистрированных пользователей в формате "2022-01-02",  2022 - год, где 01 - месяца, 02 - день месяц,`)
}
const searchPhone = async (user, chatId, msg) => {
    user.state = 12
    await user.save()
    return bot.sendMessage(chatId, `Напишите  телефон в формате "89999999999"`)
}

const searchId = async (user, chatId, msg) => {
    user.state = 13
    await user.save()
    return bot.sendMessage(chatId, `Напишите  id`)
}
/* #endregion */


const defaultFunc = async (user, chatId, msg) => {

    switch (user.state) {
        case 0: {
            await UserModule.calculate0(bot, user, chatId, msg)
        }
            break
        case 1: {
            await UserModule.calculate1(bot, user, chatId, msg)
        }
            break
        case 2: {
            await UserModule.calculate2(bot, user, chatId, msg)
        }
            break
        case 11: {
            if (!user.admin) {
                return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08')
            }
            await AdminModule.calculate11(bot, user, chatId, msg)
        }
            break
        case 12: {
            if (!user.admin) {
                console.log('12 Ты не администратор')
                return bot.sendMessage(chatId, 'Ты не админиистратор')

            }
            await AdminModule.calculate12(bot, user, chatId, msg)
        }
            break
        case 13: {
            if (!user.admin) {
                console.log('13 Ты не администратор')
                return bot.sendMessage(chatId, 'Ты не админиистратор')
            }
            await AdminModule.calculate13(bot, user, chatId, msg)
        }
            break

        default:
            break
    }

}






