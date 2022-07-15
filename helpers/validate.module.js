exports.checkDate = (itemElem) => {
    return (/[a-zа-яё]/.test(itemElem) || itemElem.length != 10);
};

exports.checkPhone = (itemElem) => {
    
    return (/[a-zа-яё]/.test(itemElem) || itemElem.length !=11);
};
exports.checkName = (itemElem) => {
    return /\d/.test(itemElem);
};