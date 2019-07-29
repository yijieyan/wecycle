const Router = require('koa-router');
const {
  signUp,
  signIn,
  update,
  list,
  findByUserId
} = require('../../control/user');

const {
  authUser
} = require('../../../middlewares/auth');

const router = new Router({
  prefix: '/v1/user'
});

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.put('/update', authUser, update);
router.get('/list', authUser, list);
router.get('/:id', findByUserId);
module.exports = router;
