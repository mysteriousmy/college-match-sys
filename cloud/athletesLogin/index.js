// 云函数入口文件
const cloud = require('wx-server-sdk')
const aes = require('./utils/aes_util')
const databases = require('./const/database');

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
    let name = event.athletes_name;
    let password = event.athletes_password;
    if (name.length === 0 || password.length === 0) {
        return ({
            code: 400,
            msg: "请输入数据"
        })
    }
    let encrypt_name = aes.Base64Encode(aes.AesEncrypt(name))
    let encrypt_password = aes.Base64Encode(aes.AesEncrypt(password))
    let result = await db.collection(databases.athletes_user).where({
        althetes_name: encrypt_name,
        althetes_password: encrypt_password
    }).get();
    if (result.data.length == 0) {
        return ({
            code: 400,
            msg: "用户名或密码错误!",
        })
    }
    return ({
        code: 200,
        msg: '登录成功!',
        data: result.data
    });
}