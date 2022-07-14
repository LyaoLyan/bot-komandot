
const ValidateModule = require('../helpers/validate.module')
const fs = require('fs')


/* #region  User function */
exports.calculate0 = async (bot, user, chatId, msg) => {
    const text = msg.text;
    if (ValidateModule.checkName(text)) {
        return bot.sendMessage(chatId, `Упс! Кажется, ФИО с ошибкой... попробуйте ввести снова 😉. Номер нужно ввести без +7 в начале в формате "89999999999"`);
    } else {
        user.state = 1;
        user.name = text;
        await user.save();
        return bot.sendMessage(chatId, `2️⃣ Введите номер телефона, который привязан к карте "Копилка", в формате "89999999999"`);
    }

};


exports.calculate1 = async (bot, user, chatId, msg) => {
    const text = msg.text;
    if (ValidateModule.checkPhone(text)) {
        return bot.sendMessage(chatId, `Вы ввели номер с ошибкой, напишите ещё раз! 😊`);
    } else {
        user.state = 2;
        user.phone = text;
        await user.save();
        return bot.sendMessage(chatId, `Прикрепите фото`);
        // return bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`)

    }
};


exports.calculate2 = async (bot, user, chatId, msg) => {
    console.log(msg);
    user.state = 3;


    const image = await bot.downloadFile(msg.document.file_id, './');
    // console.log(msg);

    const test5 = base64_encode(`./${image}`);

    fs.unlink(`./${image}`, (err) => {
        if (err) throw err; //handle your error the way you want to;
    });

    user.image = test5;

    await user.save();
    return await bot.sendMessage(chatId, `Благодарим Вас! 👍 Баллы поступят на карту "Копилка" в ближайшее время`);
};
/* #endregion */

const base64_encode = (file) => {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
};