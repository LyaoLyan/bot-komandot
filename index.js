const TelegramApi = require('node-telegram-bot-api')
const sequelize = require("./db")
const UserModel = require("./models")
const token = '5580876526:AAFQeKmBlqmXoPC5eZhwRa4vVRTELunTNz4'
const bot = new TelegramApi(token, { polling: true })
const fs = require('fs')

const AdminModule = require('./modules/admin.module')

// function to encode file data to base64 encoded string
const base64_encode = (file) => {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64')
}



const checkDate = (itemElem) => {
    return (/[a-zа-яё]/.test(itemElem) || itemElem.length > 10 || itemElem.length < 8)
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
                case '/search_phone': {
                    if (!user.admin) {
                        return console.log('search_phone Ты не администратор')
                    }
                    await searchPhone(user, chatId, msg)
                }
                    break
                case '/search_id': {
                    if (!user.admin) {
                        return console.log('search_id Ты не администратор')
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
    const date = new Date(user.updatedAt)
    return bot.sendMessage(chatId, `Ваш профиль\nID: ${user.id}\nФИО: ${user.name}\nТелефон: ${user.phone}`)
}

const becomeAdmin = async (user, chatId, msg) => {
    user.admin = true
    user.state = 11
    await user.save()
    return bot.sendMessage(chatId, `Напишите дату, в которой вы хотите посмотреть зарегистрированных пользователей в формате "1 2 2022", где 1 - день месяца, 2 - месяц, 2022 - год`)
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
                return console.log('11 Ты не администратор')
            }
            await calculate11(user, chatId, msg)
        }
            break
        case 12: {
            if (!user.admin) {
                return console.log('12 Ты не администратор')
            }
            await calculate12(user, chatId, msg)
        }
            break
        case 13: {
            if (!user.admin) {
                return console.log('13 Ты не администратор')
            }
            await calculate13(user, chatId, msg)
        }
            break

        default:
            break
    }

}



/* #region  Admin function */
const calculate11 = async (user, chatId, msg) => {
    bot.sendMessage(chatId, `Пожалуйста, подождите. Это может занять какое-то время`)
    if (checkDate(text)) return bot.sendMessage(chatId, `Неправильно введена дата, убедитесь что дата в формате "1 2 2022"`)
    var day = text.slice(0, 1)
    var month = text.slice(2, 3)
    var year = text.slice(-4)
    user.state = 12
    await user.save()
    const below = new Date(year, month - 1, day)
    const above = new Date(year, month - 1, day + 1)
    const users = await UserModel.findAll({
        where: { updatedAt: { [sequelize.between]: [below, above] } },
    })
    let list
    users.forEach((us) => {
        list += `${us.id} ${us.name} ${us.phone}\n`
    })
    return sendMessage(chatId, `${list}`)
}


const calculate12 = async (user, chatId, msg) => {
    const client = await UserModel.findOne({ where: { phone: text } })
    //а если не найдет?
    return bot.sendMessage(chatId, `id:${user.id}\nname:${user.name}\nphone:${user.phone}`)
}


const calculate13 = async (user, chatId, msg) => {
    const client = await UserModel.findOne({ where: { id: text } })
    //а если не найдет?
    return bot.sendMessage(chatId, `id:${user.id} name:${user.name} phone:${user.phone} `)
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
        return bot.sendMessage(chatId, `Прикрепите фото`)
        // return bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`)

    }
}


const calculate2 = async (user, chatId, msg) => {

    user.state = 3


    const image = await bot.downloadFile(msg.document.file_id, './')


    const test5 = base64_encode(`./${image}`)



    fs.unlink(`./${image}`, (err) => {
        if (err) throw err //handle your error the way you want to;
        console.log('path/file.txt was deleted')//or else the file will be deleted
    })


    user.image = test5


    await user.save()
    return await bot.sendMessage(chatId, `Не беспокойтесь! Ваши баллы уже в пути 😁 Если хотите, мы можем записать анкету заново.\nДля этого введите ⬇️\n/start`)
}
/* #endregion */