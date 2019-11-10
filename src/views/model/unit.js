exports.checkNumber = (rule, value, callback) => {
    let valueNumber = parseInt(value)
    if (value == valueNumber.toString()) {
        callback()
    } else {
        callback('请输入数字类型的编号')
    }
}
