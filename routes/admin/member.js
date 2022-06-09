const express = require('express');
const router = express.Router();
const { getToken, getTokenAdmin, tokenDecode, isEmpty, regExp, removeLastComma, upload, mul_uploader } = require('../../common');
const { getAdminInfo, registAdmin, getAdmin, selectCategory, registTBWORK } = require('../../query/admin/member');
const { s3_host, s3_bucket } = require('../../config');
const msg = require('../../message');
const sha256 = require('sha256');
const { ExpectationFailed } = require('http-errors');

router.post('/', async (req, res) => {
    let { admin_nm, admin_level, admin_pw, admin_email, admin_phone, admin_cmpny_nm, admin_part } = req.body;

    let token = '';

    if (isEmpty(admin_nm) || isEmpty(admin_pw) || isEmpty(admin_email) || isEmpty(admin_phone) || isEmpty(admin_cmpny_nm) ) {
        return res.status(400).send(msg.DATA_INVALID);
    } else {
        if (!regExp(admin_phone, 'phone')) {
            return res.status(401).json({
                status: 'fail',
                message: '잘못된 전화번호 형식',
            });
        }
    }

    admin_pw = sha256(admin_pw);

    let obj = { admin_nm, admin_level, admin_pw, admin_email, admin_phone, admin_cmpny_nm, admin_part };

    let findResult = await getAdminInfo({ admin_email: obj.admin_email });

    if (isEmpty(findResult)) {
        let registResult = await registAdmin(obj);

        token = getToken({ idx: registResult.insertId });

        if (registResult.affectedRows == 0) {
            return res.status(409).send(msg.CONFLICT);
        } else {
            let cdObj = {};
            cdObj.admin_idx = registResult.insertId;

            let cdResult = await getAdmin(cdObj);

            return res.status(200).send({
                message: '회원가입이 완료되었습니다.',
                token: token,
                admin_idx: registResult.insertId,
                admin_level: cdResult.data[0]['admin_level'],
                admin_email: cdResult.data[0]['admin_email'],
                admin_phone: cdResult.data[0]['admin_phone'],
                admin_nm: cdResult.data[0]['admin_nm'],
                admin_cmpny_nm: cdResult.data[0]['admin_cmpny_nm'],
                admin_part: cdResult.data[0]['admin_part']
            });
        }
    } else {
        return res.status(403).send({
            message: '이미 가입된 회원입니다.',
        });
    }
});


router.get('/', async (req, res) => {
    let { admin_idx } = req.body;
    let loginResult = '';
    let token = '';

    infoResult = await getAdminInfo({ admin_idx: admin_idx });

    if (infoResult.length !== 0) {
        token = getTokenAdmin({ idx: admin_idx });
    }

    if (token) {
        return res.status(200).json({
            status: 'success',
            dataSource: {
                token: token,
                admin_idx: infoResult[0].admin_idx,
                admin_level: infoResult[0].admin_level,
                admin_email: infoResult[0].admin_email,
                admin_phone: infoResult[0].admin_phone,
                admin_nm: infoResult[0].admin_nm,
                admin_cmpny_nm: infoResult[0].admin_cmpny_nm,
                admin_part: infoResult[0].admin_part,
            },
        });
    } else {
        return res.status(400).json({
            message: '데이터가 존재하지 않습니다.',
            dataSource: [],
        });
    }
});

router.get('/category', async (req, res) => {
    let categoryResult = await selectCategory();

    if (isEmpty(categoryResult)) {
        return res.status(403).send({
            message: '조회되는 전문분야 데이터가 없습니다.',
        });
    } else {
        return res.status(201).send({
            message: '조회 완료됐습니다.',
            category: categoryResult['data'],
        });
    }
}); // router.get('/')

module.exports = router;
