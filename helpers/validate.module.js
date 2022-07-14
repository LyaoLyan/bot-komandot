exports.checkDate = (itemElem) => {
    return (/[a-zа-яё]/.test(itemElem) || itemElem.length != 10);
};

exports.checkPhone = (itemElem) => {
    return (/[a-zа-яё]/.test(itemElem));
};
exports.checkName = (itemElem) => {
    return /\d/.test(itemElem);
};