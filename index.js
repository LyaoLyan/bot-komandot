const TelegramApi = require('node-telegram-bot-api')
const sequelize = require("./db")
const UserModel = require("./models/user.model")
const token = '5580876526:AAFQeKmBlqmXoPC5eZhwRa4vVRTELunTNz4'
const bot = new TelegramApi(token, { polling: true })
const fs = require('fs')
const AdminModule = require('./modules/admin.module')

const { Op } = require("sequelize")

// function to encode file data to base64 encoded string
const base64_encode = (file) => {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64')
}



const checkDate = (itemElem) => {
    return (/[a-zа-яё]/.test(itemElem) || itemElem.length != 10)
}

const checkPhone = (itemElem) => {
    return (/[a-zа-яё]/.test(itemElem))
}
const checkName = (itemElem) => {
    return /\d/.test(itemElem)
}

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
            await bot.sendMessage(chatId, "Что-то пошло не так!")
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
            await calculate0(user, chatId, msg)
        }
            break
        case 1: {
            await calculate1(user, chatId, msg)
        }
            break
        case 2: {
            await calculate2(user, chatId, msg)
        }
            break
        case 11: {
            if (!user.admin) {
                return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08')
            }
            await calculate11(user, chatId, msg)
        }
            break
        case 12: {
            if (!user.admin) {
                console.log('12 Ты не администратор')
                return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08')

            }
            await calculate12(user, chatId, msg)
        }
            break
        case 13: {
            if (!user.admin) {
                console.log('13 Ты не администратор')
                return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08')
            }
            await calculate13(user, chatId, msg)
        }
            break

        default:
            break
    }

}


const getEdgesOfDay = (date) => {
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    return { startOfDay, endOfDay }
}

/* #region  Admin function */
const calculate11 = async (user, chatId, msg) => {
    try {


        var t = msg.text

        await bot.sendMessage(chatId, `Пожалуйста, подождите. Это может занять какое-то время`)

        if (checkDate(t)) return bot.sendMessage(chatId, `Неправильно введена дата, убедитесь что дата в формате "2022-01-02"`)

        const { startOfDay, endOfDay } = getEdgesOfDay(msg.text)

        const usersRaw = await UserModel.findAll({
            where: {
                createdAt: {
                    [Op.lt]: `${endOfDay.toISOString()}`,
                    [Op.gt]: `${startOfDay.toISOString()}`
                }
            },
        })

        let usersStrings = usersRaw.map(item => {
            const { id, name, phone } = item
            return `${id} | ${name} ${phone}`
        })

        return await bot.sendMessage(chatId, usersStrings.join('\n'))
    } catch (error) {
        if (error == "Error: ETELEGRAM: 400 Bad Request: message text is empty") {
            return await bot.sendMessage(chatId, `Нет пользователей, зарегистрированных в этот день`)
        } else {
            return await bot.sendMessage(chatId, `Что-то пошло не так. Ты уверен, что корректно ввел да?`)
        }

    }
}


const calculate12 = async (user, chatId, msg) => {
    try {
        const client = await UserModel.findOne({ where: { phone: msg.text } })
        const file = `image/jpg;base64,${client.image}`;
        const fileOpts = {
            filename: 'image',
            contentType: 'image/jpg',
        };
        bot.sendMessage(chatId, `${user.id} | ${user.name} ${user.phone}`)
        return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
    } catch {
        if (er == "TypeError: Cannot read properties of null (reading 'image')") {
            return bot.sendMessage(chatId, `Пользователя с таким номером телефона не существует`)
        } else {
            return bot.sendMessage(chatId, `Что-то пошло не так. Ты уверен, что корректно ввел телефон?`)
        }
    }
}


const calculate13 = async (user, chatId, msg) => {
    try {
        const client = await UserModel.findByPk(Number(msg.text))
        const file = `image/jpg;base64,${client.image}`;
        const fileOpts = {
            filename: 'image',
            contentType: 'image/jpg',
        };

        bot.sendMessage(chatId, `${user.id} | ${user.name} ${user.phone}`)
        return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
    } catch (er) {
        if (er == "TypeError: Cannot read properties of null (reading 'image')") {
            return bot.sendMessage(chatId, `Пользователя с таким ID не существует`)
        } else {
            return bot.sendMessage(chatId, `Что-то пошло не так. Ты уверен, что корректно ввел ID?`)
        }
    }

}
/* #endregion */


/* #region  User function */
const calculate0 = async (user, chatId, msg) => {
    const text = msg.text
    if (checkName(text)) {
        return bot.sendMessage(chatId, `Упс! Кажется, ФИО с ошибкой... попробуйте ввести снова 😉. Номер нужно ввести без +7 в начале в формате "89999999999"`)
    } else {
        user.state = 1
        user.name = text
        await user.save()
        return bot.sendMessage(chatId, `2️⃣ Введите номер телефона, который привязан к карте "Копилка", в формате "89999999999"`)
    }

}


const calculate1 = async (user, chatId, msg) => {
    const text = msg.text
    if (checkPhone(text)) {
        return bot.sendMessage(chatId, `Вы ввели номер с ошибкой, напишите ещё раз! 😊`)
    } else {
        user.state = 2
        user.phone = text
        await user.save()
        return bot.sendMessage(chatId, ``)
        // return bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`)

    }
}


const calculate2 = async (user, chatId, msg) => {
    try {
        console.log(msg);
        user.state = 3
        let d = new Date()
        console.log(d);
        let y = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        console.log(y);
        user.date = Number(y.getTime());
        console.log(user.date);
        const image = await bot.downloadFile(msg.document.file_id, './')
        // console.log(msg);

        const test5 = base64_encode(`./${image}`)

        fs.unlink(`./${image}`, (err) => {
            if (err) throw err //handle your error the way you want to;
            console.log('path/file.txt was deleted')//or else the file will be deleted
        })

        user.image = test5

        await user.save()
        return await bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`)
    } catch (error) {

    }
}
/* #endregion */