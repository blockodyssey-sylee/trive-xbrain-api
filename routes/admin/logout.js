const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    req.session.idx = null;
    req.session.name = null;
    req.session.email = null;
    req.session.level = null;
    res.clearCookie('connect.sid');
    req.session.destroy();

    return res.send({ status: 'success', message: '로그아웃 되였습니다.' });
});

module.exports = router;
