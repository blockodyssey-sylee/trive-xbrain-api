const express = require('express');
const router = express.Router();
const sha256 = require('sha256');
const { login } = require('.');
const { getTokenAdmin, stringDateFormat } = require('../../common');
const { getAdminLogin } = require('../../query/admin/login');
const { getAdminInfo } = require('../../query/admin/member');

router.get('/', async (req, res) => {
    let { admin_email, admin_pw } = req.body;
    let loginResult = '';
    let token = '';

    enc_pw = sha256(admin_pw);
    loginResult = await getAdminLogin({ admin_email, enc_pw });

    if (loginResult.length !== 0) {
        token = getTokenAdmin({ idx: loginResult[0].key });

        req.session.idx = loginResult[0].key;
        req.session.name = loginResult[0].admin_nm;
        req.session.email = loginResult[0].admin_email;
        req.session.level = loginResult[0].admin_level;
    }

    if (token) {
        cmpanyInfo = await getAdminInfo({ admin_idx: loginResult[0].key });
        return res.status(200).json({
            status: 'success',
            dataSource: {
                admin_idx: loginResult[0].key,
                admin_level: loginResult[0].admin_level,
                admin_email: loginResult[0].admin_email,
                admin_phone: loginResult[0].admin_phone,
                admin_nm: loginResult[0].admin_nm,
                admin_cmpny_nm: loginResult[0].admin_cmpny_nm,
                admin_part: loginResult[0].admin_part,
            },
        });
    } else {
        return res.status(400).json({
            message: '데이터가 존재하지 않습니다.',
            dataSource: [],
        });
    }
});

router.get('/getinfo', async (req, res) => {
    if (typeof req.session.idx === 'undefined') {
        return res.status(401).json({
            error: 'THERE IS NO LOGIN DATA ',
            code: 1,
        });
    }

    cmpanyInfo = await getAdminInfo({ admin_idx: req.session.idx });
    return res.status(200).json({
        status: 'success',
        dataSource: {
            admin_idx: cmpanyInfo[0].key,
            admin_level: cmpanyInfo[0].admin_level,
            admin_email: cmpanyInfo[0].admin_email,
            admin_phone: cmpanyInfo[0].admin_phone,
            admin_nm: cmpanyInfo[0].admin_nm,
            admin_cmpny_nm: cmpanyInfo[0].admin_cmpny_nm,
            admin_part: cmpanyInfo[0].admin_part,
            admin_code: cmpanyInfo[0].admin_code,
        },
    });
});

module.exports = router;
