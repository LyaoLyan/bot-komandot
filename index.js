
const TelegramApi = require('node-telegram-bot-api');
const sequelize = require("./db");
const UserModel = require("./models/user.model");
const token = '5580876526:AAFQeKmBlqmXoPC5eZhwRa4vVRTELunTNz4';
const bot = new TelegramApi(token, { polling: true });

const AdminModule = require('./modules/admin.module');
const UserModule = require('./modules/user.module');

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


    await AdminModule.test();

    bot.on('message', async msg => {

        const text = msg.text;
        const chatId = msg.chat.id;
        try {
            await sequelize.authenticate();
            await sequelize.sync();
        } catch (error) {
            return bot.sendMessage(chatId, `Извините, у нас ведутся технические работы. Пожалуйста, зайдите чуть позже 😌`);
        }


        try {

            await checkUserInDb(chatId, msg);

            const user = await UserModel.findOne({ where: { chatId: String(chatId) } });

            switch (text) {
                case '/start': {
                    await startFunc(user, chatId, msg);
                }
                    break;
                case '/profile': {
                    await profileFunc(user, chatId, msg);
                }
                    break;
                case 'D4%d87k}vLGG': {
                    await becomeAdmin(user, chatId, msg);
                }
                    break;
                case '/search_by_date': {
                    await searchByDate(user, chatId, msg);
                }
                    break;
                case '/search_phone': {
                    if (!user.admin) {
                        return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08');
                    }
                    await searchPhone(user, chatId, msg);
                }
                    break;
                case '/search_id': {
                    if (!user.admin) {
                        return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08');
                    }
                    await searchId(user, chatId, msg);
                }
                    break;
                case '/send_message': {
                    if (!user.admin) {
                        return bot.sendMessage(chatId, 'Этой командой может пользоваться только администратор, чтобы узнать пароль, обратитесь к @mishagina08');
                    }
                    await sendMessageFromAdmin(user, chatId, msg);
                }
                    break;
                default: {

                    await defaultFunc(user, chatId, msg);
                }
                    break;
            }

        } catch (error) {
            console.log(error)
            await bot.sendMessage(chatId, "Что-то пошло не так! Обратитесь в тех. поддержку")
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

    });

};
start();





/* #region  Helper function */
const checkUserInDb = async (id, msg) => {

    const { from, chat } = msg;
    console.log(id);
    let test = await UserModel.findOne({ where: { chatId: String(id) } });

    if (!test) {
        console.log('Создаем нового пользователя');
        await UserModel.create({ chatId: id });

    }
    test = await UserModel.findOne({ where: { chatId: String(id) } });
    console.log('Пользователь существует');

};

const startFunc = async (user, chatId, msg) => {
    user.state = 0;

    await user.save();
    return bot.sendMessage(chatId, `Приветствуем Вас на борту 🚢 корабля "Командор"! 👋 Зарегистрируйтесь в чат-боте за 10 секунд и получите 100 БАЛЛОВ❗️ на карту "Копилка". Приступим! 🔥⬇️\n1️⃣ Введите Ваше ФИО`);
};


const profileFunc = async (user, chatId, msg) => {
    const file = `image/jpg;base64,${user.image}`;
    const fileOpts = {
        filename: 'image',
        contentType: 'image/jpg',
    };
    bot.sendMessage(chatId, `Ваш профиль\nID: ${user.id}\nФИО: ${user.name}\nТелефон: ${user.phone}`);
    return bot.sendPhoto(chatId, Buffer.from(file.substr(17), 'base64'), fileOpts);
};

const becomeAdmin = async (user, chatId, msg) => {
    user.admin = true;
    await user.save();
    return bot.sendMessage(chatId, `Добро пожаловать! Для начала работы введите необходимую команду: \n/search_by_date - Поиск ID пользователей по дате добавления\n/search_phone - Поиск пользователя по телефону\n/search_id - Поиск пользователя по ID\n/send_message - Отправить сообщение пользователям по ID`);
};

const searchByDate = async (user, chatId, msg) => {
    user.state = 11;
    await user.save();
    return bot.sendMessage(chatId, `Чтобы получить информацию о зарегистрированных пользователях по дате добавления, введите интересующую Вас дату в формате 2022-01-02, где 2022 - год, 01 - месяц, 02 – день.`);
};
const searchPhone = async (user, chatId, msg) => {
    user.state = 12;
    await user.save();
    return bot.sendMessage(chatId, `Пожалуйста, введите номер телефона пользователя в формате "89999999999".`);
};
const searchId = async (user, chatId, msg) => {
    user.state = 13;
    await user.save();
    return bot.sendMessage(chatId, `Пожалуйста, введите ID пользователя, который Вас интересует.`);
};
/* #endregion */
const sendMessageFromAdmin = async (user, chatId, msg) => {
    user.state = 14;
    await user.save();
    return bot.sendMessage(chatId, `Напишите id пользователей через пробел, которым хотите отправить сообщение и сообщение через /. Пример:\n12 8 4 2 6 / Привет!`);
}

const defaultFunc = async (user, chatId, msg) => {

    switch (user.state) {
        case 0: {
            await UserModule.calculate0(bot, user, chatId, msg);
        }
            break;
        case 1: {
            await UserModule.calculate1(bot, user, chatId, msg);
        }
            break;
        case 2: {
            await UserModule.calculate2(bot, user, chatId, msg);
        }
            break;
        case 11: {
            if (!user.admin) {
                return bot.sendMessage(chatId, 'Упс! Этой командой могут пользоваться только администраторы. Похоже, Вы не из их числа. Чтобы исправить это, обратитесь к @mishagina08');
            }
            await AdminModule.calculate11(bot, user, chatId, msg);
        }
            break;
        case 12: {
            if (!user.admin) {

                console.log('12 Ты не администратор');
                return bot.sendMessage(chatId, 'Упс! Этой командой могут пользоваться только администраторы. Похоже, Вы не из их числа. Чтобы исправить это, обратитесь к @mishagina08');
            }
            await AdminModule.calculate12(bot, user, chatId, msg);
        }
            break;
        case 13: {
            if (!user.admin) {
                console.log('13 Ты не администратор');
                return bot.sendMessage(chatId, 'Упс! Этой командой могут пользоваться только администраторы. Похоже, Вы не из их числа. Чтобы исправить это, обратитесь к @mishagina08');
            }
            await AdminModule.calculate13(bot, user, chatId, msg);
        }
            break;
        case 14: {
            if (!user.admin) {
                console.log('13 Ты не администратор');
                return bot.sendMessage(chatId, 'Упс! Этой командой могут пользоваться только администраторы. Похоже, Вы не из их числа. Чтобы исправить это, обратитесь к @mishagina08');
            }
            await AdminModule.calculate14(bot, user, chatId, msg);
        }
            break;
        default:
            break;
    }

};



