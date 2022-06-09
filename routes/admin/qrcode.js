const express = require('express');
const router = express.Router();
//const sha256 = require('sha256');
const { tokenDecodeUser, isEmpty } = require('../../common');
//const {s3_host} = require('../config')
//const Workbook = require('workbook');
const msg = require('../../message');
const encoder = require('../../gencode/encoder.js');
const { getLocationInfo } = require('../../query/admin/work');
const { getAdminInfo } = require('../../query/admin/member');

/* 관리자에서 TB_USER_QR에 데이터 insert */
router.post('/', async (req, res) => {
    let { admin_code, qr_memo, entry_rate_type } = req.body;
    let { idx } = req.session;

    if (req.session.idx) {
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let workResult = await getLocationInfo({ admin_idx: req.session.idx });

    let cmpnyResult = await getAdminInfo({ admin_code: admin_code });

    if (cmpnyResult[0].del_yn == 'Y') {
        return res.status(400).send({
            message: '삭제된 회사입니다.',
        });
    }

    if (cmpnyResult[0].admin_state == 'N') {
        return res.status(400).send({
            message: '정지된 회사입니다.',
        });
    }

    let encoderData = await encoder(null, 1, 8, '', 6, 'hp', 'N', 0, '');
    let qr = encoderData[0][2]['v'];

    // encoded_key : encoderData[j][2]['v']
    console.log('URL MAKE :: ' + encoderData[0][2]['v']);

    //obj = { admin_code, qr_memo, idx, qr}
    obj = { admin_code, qr_memo, qr, entry_rate_type };
    obj.idx = cmpnyResult[0].key;
    obj.reg_admin_code = cmpnyResult[0].reg_admin_code;
    obj.work_idx = workResult[0].work_idx;
    let registAdminQrResult = await registAdminQr(obj);

    if (registAdminQrResult.affectedRows == 0) {
        return res.status(409).send(msg.CONFLICT);
    } else {
        return res.status(200).json({
            status: 'success',
            dataSource: [
                {
                    qr: encoderData[0][2]['v'],
                },
            ],
        });
    }
});

router.get('/cmpnyList', async (req, res) => {
    let {} = req.query;
    let obj = {};

    if (req.session.idx) {
        obj.admin_level = req.session.level;
        obj.admin_idx = req.session.idx;
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let findResultLogin = await getAdminInfo({ admin_idx: req.session.idx });
    obj.login_admin_code = findResultLogin[0].admin_code;

    let findResult = await getCompanyAccountList(obj);

    let dataSource = [];
    let total_count = findResult.count[0].total_count;
    let getResult = findResult.data;

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            total_count,
            list: getResult,
        });
    } else {
        return res.status(400).send({
            status: 'success',
            message: '조회되는 데이터가 없습니다.',
            dataSource,
        });
    }
});

module.exports = router;
