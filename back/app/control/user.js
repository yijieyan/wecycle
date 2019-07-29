
const User = require('../models/user.js');
const {
  createToken
} = require('../../libs/token');
class UserCtrl {
  /**
   * @apiGroup User
   * @api {POST} /user/signUp 注册用户
   * @apiDescription 注册用户
   * @apiParam {String} username  用户名
   * @apiParam {String} password  密码
   * @apiParam {Number} [age] 年龄
   * @apiVersion 1.0.0
   * @apiSuccessExample {json} Success-Response:
   * {
   *   "code": 0,
   *   "data": {
   *      "msg": "tom注册成功"
   *    }
   * }
   */
  async signUp (ctx) {
    ctx.verifyParams({
      username: 'string',
      password: 'string',
      age: {
        type: 'number',
        required: false
      }
    });
    const username = ctx.request.body.username;
    const password = User.generatePwd(ctx.request.body.password);
    let user = await User.findOne({
      username
    });
    if (!user) {
      let obj = Object.assign(ctx.request.body, {
        password
      });
      user = await User.create(obj);
    } else {
      throw new Error('用户已经被注册过');
    }
    ctx.success({
      msg: `${username}注册成功`
    });
  }

  /**
   * @apiGroup User
   * @api {POST} /user/signIn  用户登录
   * @apiDescription 用户登录
   * @apiParam {String} username  用户名
   * @apiParam {String} password  密码
   * @apiVersion 1.0.0
   * @apiSuccess {Object} token token
   * @apiSuccessExample {json} Success-Response:
   *{
   *   "code": 0,
   *   "data": {
   *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDA5OTFjZTE1M2IzNTU1YWE2MWI1MDMiLCJpYXQiOjE1NjEwODAyNzIsImV4cCI6MTU2MTE2NjY3Mn0.Uln-TF30Il_gUiy0lT-DVEV4crrBNmHTBJB4Wh2qttA",
   *       "userId": "5d0991ce153b3555aa61b503"
   *   }
   * }
   */
  async signIn (ctx) {
    ctx.verifyParams({
      username: 'string',
      password: 'string'
    });
    let password = ctx.request.body.password;
    let username = ctx.request.body.username;
    let user = await User.findOne({
      username
    }).select('+password');
    if (user) {
      let isExist = User.verifyPwd(password, user.password);
      if (isExist) {
        let token = await createToken(user._id);
        ctx.success({ token, userId: user._id });
      }
    } else {
      throw new Error(`当前用户:${username} 不存在`);
    }
  }

  /**
   * @apiGroup User
   * @api {PUT} /user/update/:id  修改用户信息
   * @apiHeader {String} Authorization 用户的token
   * @apiDescription 通过用户的唯一标识来修改用户信息
   * @apiParam  {String} [username] 用户名
   * @apiParam  {String} [password] 用户密码
   * @apiParam  {String} [avatarUrl] 头像
   * @apiParam  {String} [gender] 性别
   * @apiParam  {String} [headline] 一句话介绍
   * @apiParam  {array} [locations] 居住地话题的ObjectId
   * @apiParam  {array} [profession] 职业经历的ObjectId
   * @apiParam  {array} [educations] 学历的ObjectId
   * @apiParam  {array} [description] 描述
   * {
   *    "Authorization": "Bearer  token"
   * }
   * @apiVersion 1.0.0
   * @apiSuccessExample {json} Success-Response:
   *{
   *   "code": 0,
   *   "data": {
   *      "msg":"update successful"
   *    }
   *}
   */
  async update (ctx) {
    ctx.verifyParams({
      username: {
        type: 'string',
        required: false
      },
      password: {
        type: 'string',
        required: false
      },
      avatarUrl: {
        type: 'string',
        required: false
      },
      gender: {
        type: 'string',
        required: false
      },
      headline: {
        type: 'string',
        required: false
      },
      locations: {
        type: 'array',
        itemType: 'string',
        required: false
      },
      business: {
        type: 'string',
        required: false
      },
      profession: {
        type: 'array',
        itemType: 'object',
        required: false
      },
      educations: {
        type: 'array',
        itemType: 'object',
        required: false
      },
      description: {
        type: 'string',
        required: false
      }
    });

    let obj = ctx.request.body;
    if (obj.password) {
      obj.password = User.generatePwd(obj.password);
    }
    await User.findOneAndUpdate({
      _id: ctx.state.user.userId
    }, {
      $set: obj
    }, {
      new: true
    });
    ctx.success({ msg: `update successful` });
  }
  /**
   * @apiGroup User
   * @api {GET} /user/list  获取用户列表
   * @apiHeader {String} Authorization 用户的token
   * @apiDescription 获取用户列表
   * @apiParam  {String} [fileds] 需要查询的字段
   * @apiParam  {String} [pageNum=1] 当前的页码,默认第一页
   * @apiParam  {String} [pageSize=10] 每页显示的数量
   * {
   *    "Authorization": "Bearer  token"
   * }
   * @apiVersion 1.0.0
   * @apiSuccessExample {json} Success-Response:
   *{
   *   "code": 0,
   *   "data": [
   *       {
   *           "gender": "male",
   *           "_id": "5d0c330f7f8b17e3e49f871c",
   *           "username": "jack",
   *           "educations": [],
   *           "createdAt": "2019-06-21T01:29:51.590Z",
   *           "updatedAt": "2019-06-21T01:29:51.590Z"
   *       },
   *       {
   *           "gender": "male",
   *           "_id": "5d0c331b7f8b17e3e49f871d",
   *           "username": "lily",
   *           "educations": [],
   *           "createdAt": "2019-06-21T01:30:03.044Z",
   *           "updatedAt": "2019-06-21T01:30:03.044Z"
   *       }
   *   ]
   *}
   */
  async list (ctx) {
    let { fileds = '', pageNum = 1, pageSize = 10 } = ctx.query;
    pageNum = Math.max(+pageNum, 1) - 1;
    pageSize = Math.max(+pageSize, 1);
    let selectFields = fileds.split(';').filter(item => item).map(item => ' +' + item).join('');
    let userList = await User.find().skip(pageNum * pageSize).limit(pageSize).select(selectFields);
    ctx.success(userList);
  }
  /**
   * @apiGroup User
   * @api {GET} /user/:id  通过用户的Id获取用户信息
   * @apiDescription 通过用户的唯一标识来修改用户信息
   * @apiParam  {String} id 需要查询的字段
   * @apiParam  {String} [fileds] 需要查询的字段
   * @apiVersion 1.0.0
   * @apiSuccessExample {json} Success-Response:
   *{
   *   "code": 0,
   *   "data": [
   *       {
   *           "gender": "male",
   *           "_id": "5d0c330f7f8b17e3e49f871c",
   *           "username": "jack",
   *           "createdAt": "2019-06-21T01:29:51.590Z",
   *           "updatedAt": "2019-06-21T01:29:51.590Z"
   *       }
   *   ]
   * }
   */
  async findByUserId (ctx) {
    let { fileds = '' } = ctx.query;
    let selectFields = fileds.split(';').filter(item => item).map(item => ' +' + item).join('');
    let populateStr = fileds.split(';').filter(item => item).map(item => {
      if (item === 'profession') {
        return 'profession.company profession.position';
      } else if (item === 'educations') {
        return 'educations.scholl educations.major';
      } else {
        return item;
      }
    }).join(' ');
    let userList = await User.find({ _id: ctx.params.id }).select(selectFields).populate(populateStr);
    ctx.success(userList);
  }
  async checkUserIsExist (ctx, next) {
    let u = await User.findById(ctx.params.id);
    if (u) {
      await next();
    } else {
      ctx.success({ msg: `用户不存在` });
    }
  }
}

module.exports = new UserCtrl();
