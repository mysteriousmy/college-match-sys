// 云函数入口文件
const cloud = require('wx-server-sdk')
const aes = require('./utils/aes_util')
const databases = require('./const/database');

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
    let name = event.admin_name;
    let password = event.admin_password;
    if (name.length === 0 || password.length === 0) {
        return ({
            code: 400,
            msg: "请输入数据"
        })
    }
    let encrypt_name = aes.Base64Encode(aes.AesEncrypt(name))
    let encrypt_password = aes.Base64Encode(aes.AesEncrypt(password))
    console.log(encrypt_name, encrypt_password);
    let result = await db.collection(databases.admin_user).where({
        admin_name: encrypt_name,
        admin_password: encrypt_password
    }).get();
    if (result.data.length == 0) {
        return ({
            code: 400,
            msg: "用户名或密码错误!",
        })
    }
    return ({
        code: 200,
        msg: '登录成功!'
    });
}