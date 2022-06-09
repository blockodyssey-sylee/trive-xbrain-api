const express = require('express');
const router = express.Router();
const { getToken, getTokenAdmin, tokenDecode, isEmpty, regExp, removeLastComma, upload, mul_uploader } = require('../../common');
const {
    getAdminCompanyList,
    getAdminAccountDetail,
    registCompany,
    updateAdminPW,
    updateAdminCompanyStop,
    updateAdminCompanyDelete,
    updateAdminPhonePart,
} = require('../../query/admin/company');
const { getAdminInfo } = require('../../query/admin/member');
const { s3_host, s3_bucket } = require('../../config');
const msg = require('../../message');
const sha256 = require('sha256');
const { ExpectationFailed } = require('http-errors');

router.post('/', async (req, res) => {
    let { cmpny_nm, cmpny_number } = req.body;
    let obj = { cmpny_nm, cmpny_number };

    if (req.session.idx) {
        obj.reg_admin_idx = req.session.idx;
        obj.reg_admin_level = req.session.level;
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let token = '';

    if (isEmpty(cmpny_nm) || isEmpty(cmpny_number)) {
        return res.status(400).send(msg.DATA_INVALID);
    } else {
    }

    let findResult = await getAdminInfo({ admin_idx: req.session.idx });

    if (isEmpty(findResult)) {
        return res.status(400).send({
            status: 'success',
            message: '조회되는 관리자가 없습니다.',
            dataSource,
        });
    } else {
        let registResult = await registCompany(obj);

        if (registResult.affectedRows != 0) {
            return res.status(200).json({
                status: 'success',
                message: ' 등록 되었습니다.',
            });
        } else {
            return res.status(400).send({
                status: 'success',
                message: '등록에 실패 했습니다.',
                dataSource,
            });
        }
    }
});

router.get('/', async (req, res) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order } = req.query;
    let obj = {
        searchType,
        searchKeyword,
        startDate,
        endDate,
        pageNumber,
        pageShow,
        sort_nm,
        sort_order,
    };

    if (req.session.idx) {
        obj.admin_level = req.session.level;
        obj.admin_idx = req.session.idx;
        obj.admin_name = req.session.name;
        obj.admin_email = req.session.email;
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let findResult = await getAdminCompanyList(obj);

    let dataSource = [];
    let total_count = findResult.count[0].total_count;
    let getResult = findResult.data;

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            total_count,
            findResult: getResult,
        });
    } else {
        return res.status(400).send({
            status: 'success',
            message: '조회되는 데이터가 없습니다.',
            dataSource,
        });
    }
});

router.get('/detail', async (req, res) => {
    let { admin_idx } = req.query;
    let obj = { admin_idx };

    let findResult = await getAdminAccountDetail(obj);

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            dataSource: {
                admin_idx: findResult[0].admin_idx,
                admin_level: findResult[0].admin_level,
                admin_email: findResult[0].admin_email,
                admin_phone: findResult[0].admin_phone,
                admin_phone_str: findResult[0].admin_phone_str,
                admin_nm: findResult[0].admin_nm,
                admin_cmpny_nm: findResult[0].admin_cmpny_nm,
                admin_part: findResult[0].admin_part,
                admin_state: findResult[0].admin_state,
                reg_dt: findResult[0].reg_dt,
                del_yn: findResult[0].del_yn,
            },
        });
    } else {
        return res.status(400).send({
            status: 'success',
            message: '조회되는 데이터가 없습니다.',
            dataSource,
        });
    }
});

router.put('/', async (req, res) => {
    let { work_idx } = req.body;

    if (isEmpty(work_idx)) {
        return res.status(400).send(msg.DATA_INVALID);
    }

    if (!req.headers.token) {
        return res.status(401).send(msg.TOKEN_REQUIRED);
    } else {
        let result = tokenDecode(req.headers.token);
        if (result == 'INVALID') {
            return res.status(401).send(msg.TOKEN_INVALID);
        }
    }
    let admin_idx = tokenDecode(req.headers.token);
    let locationUpdate = await getLocationMainUpdate({
        admin_idx: admin_idx,
        work_idx: work_idx,
    });

    if (locationUpdate.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '변경사항 저장이 실패했습니다.',
        });
    } else {
        cmpanyInfo = await getCompanyInfo({ admin_idx: admin_idx });

        return res.status(200).json({
            status: 'success',
            message: '변경사항이 저장 되었습니다.',
            dataSource: {
                work_idx: work_idx,
                work_nm: cmpanyInfo[0].work_nm,
                today: stringDateFormat(cmpanyInfo[0].today, 3),
                visit_cnt: cmpanyInfo[0].visit_cnt,
            },
        });
    }
});

router.patch('/changePw', async (req, res) => {
    let { admin_idx, admin_pw } = req.body;

    admin_pw = sha256(admin_pw);

    let obj = { admin_idx, admin_pw };

    let resultPw = await updateAdminPW(obj);

    if (resultPw.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '비밀번호 변경에 실패했습니다.',
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: '비밀번호 변경 되었습니다.',
        });
    }
});

router.put('/phonePart', async (req, res) => {
    let { admin_idx, admin_phone, admin_part } = req.body;

    let obj = { admin_idx, admin_phone, admin_part };

    let resultPhonePart = await updateAdminPhonePart(obj);

    if (resultPhonePart.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '비밀번호 변경에 실패했습니다.',
        });
    } else {
        infoResult = await getAdminInfo({ admin_idx: admin_idx });

        return res.status(200).json({
            status: 'success',
            dataSource: {
                token: getToken({ idx: admin_idx }),
                admin_idx: infoResult[0].admin_idx,
                admin_level: infoResult[0].admin_level,
                admin_email: infoResult[0].admin_email,
                admin_phone: infoResult[0].admin_phone,
                admin_nm: infoResult[0].admin_nm,
                admin_cmpny_nm: infoResult[0].admin_cmpny_nm,
                admin_part: infoResult[0].admin_part,
            },
        });
    }
});

router.patch('/stop', async (req, res) => {
    let { cmpny_idx, cmpny_state } = req.body;

    let obj = { cmpny_idx, cmpny_state };

    if (req.session.idx) {
        obj.admin_level = req.session.level;
        obj.reg_admin_idx = req.session.idx;
        obj.admin_name = req.session.name;
        obj.admin_email = req.session.email;
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let resultCmpnyStop = await updateAdminCompanyStop(obj);

    if (resultCmpnyStop.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '정지 실패했습니다.',
        });
    } else {
        return res.status(200).json({
            cmpny_idx,
            cmpny_state,
        });
    }
});

router.patch('/delete', async (req, res) => {
    let { cmpny_idx } = req.body;
    let obj = { cmpny_idx };

    if (req.session.idx) {
        obj.admin_level = req.session.level;
        obj.reg_admin_idx = req.session.idx;
        obj.admin_name = req.session.name;
        obj.admin_email = req.session.email;
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let deletePw = await updateAdminCompanyDelete(obj);

    if (deletePw.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '회사 삭제에 실패했습니다.',
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: '회사 삭제 되었습니다.',
        });
    }
});

module.exports = router;
