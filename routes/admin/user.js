const express = require('express');
const router = express.Router();
const { getToken, getTokenAdmin, tokenDecode, isEmpty, regExp, removeLastComma, upload, mul_uploader } = require('../../common');
const {
    getUserList,
    getUserDetailWorker,
    getUserDetailCmpny,
    getWorkerProfileImage,
    updateUserWithdraw,
    updateUserApprove,
    getWorkerPart,
} = require('../../query/admin/user');
const { getAdminInfo } = require('../../query/admin/member');
const { s3_host, s3_bucket } = require('../../config');
const msg = require('../../message');
const sha256 = require('sha256');
const { ExpectationFailed } = require('http-errors');

router.get('/', async (req, res) => {
    let { user_type, searchType, searchKeyword, startDate, endDate, cate_cd, pageNumber, pageShow, sort_nm, sort_order } = req.query;
    let obj = { user_type, searchType, searchKeyword, startDate, endDate, cate_cd, pageNumber, pageShow, sort_nm, sort_order };

    if (req.session.idx) {
        obj.login_admin_level = req.session.level;
        obj.login_admin_code = req.session.code;
        obj.login_admin_idx = req.session.idx;
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }
    let findResultLogin = await getAdminInfo({ admin_idx: req.session.idx });
    obj.login_admin_code = findResultLogin[0].admin_code;

    console.log(obj);
    let findResult = await getUserList(obj);

    // console.log(findResult);
    // console.log(findResult[0]);
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
    let { user_type, user_idx } = req.query;
    let obj = { user_type, user_idx };
    //console.log(admin_idx+" : "+admin_nm+" : "+admin_email);
    //console.log(user_idx);

    let findResult;

    if (user_type == 'W') {
        // 작업자 일때

        findResult = await getUserDetailWorker(obj);

        if (findResult.affectedRows != 0) {
            license_image = await getWorkerProfileImage({ user_idx: user_idx, profl_type: '1' });
            worker_image = await getWorkerProfileImage({ user_idx: user_idx, profl_type: '2' });
            work_part = [];
            work_part = await getWorkerPart({ user_idx: user_idx });

            return res.status(200).json({
                status: 'success',
                dataSource: {
                    user_idx: findResult[0].user_idx,
                    nm: findResult[0].nm,
                    gender: findResult[0].gender,
                    gender_str: findResult[0].gender_str,
                    birth: findResult[0].birth,
                    phone: findResult[0].phone,
                    phone_str: findResult[0].phone_str,
                    img_identity: findResult[0].img_identity,
                    profl_url: findResult[0].profl_url,
                    career: findResult[0].career,
                    zipcode: findResult[0].zipcode,
                    addr: findResult[0].addr,
                    addr_detail: findResult[0].addr_detail,
                    introduce: findResult[0].introduce,
                    user_state: findResult[0].user_state,
                    del_yn: findResult[0].del_yn,
                    user_type: findResult[0].user_type,
                    reg_dt: findResult[0].reg_dt,
                    work_part: work_part,
                    license_image: license_image,
                    worker_image: worker_image,
                },
            });
        } else {
            return res.status(400).send({
                status: 'success',
                message: '조회되는 데이터가 없습니다.',
                dataSource,
            });
        }
    } else {
        // user_type = M 관리자 일때

        findResult = await getUserDetailCmpny(obj);
        if (findResult.affectedRows != 0) {
            return res.status(200).json({
                status: 'success',
                dataSource: {
                    user_idx: findResult[0].user_idx,
                    nm: findResult[0].nm,
                    gender: findResult[0].gender,
                    gender_str: findResult[0].gender_str,
                    birth: findResult[0].birth,
                    phone: findResult[0].phone,
                    phone_str: findResult[0].phone_str,
                    img_identity: findResult[0].img_identity,
                    profl_url: findResult[0].profl_url,
                    career: findResult[0].career,
                    zipcode: findResult[0].zipcode,
                    addr: findResult[0].addr,
                    addr_detail: findResult[0].addr_detail,
                    introduce: findResult[0].introduce,
                    cmpny_nm: findResult[0].cmpny_nm,
                    register_number: findResult[0].register_number,
                    user_state: findResult[0].user_state,
                    del_yn: findResult[0].del_yn,
                    user_type: findResult[0].user_type,
                    reg_dt: findResult[0].reg_dt,
                },
            });
        } else {
            return res.status(400).send({
                status: 'success',
                message: '조회되는 데이터가 없습니다.',
                dataSource,
            });
        }
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
    let user_idx = tokenDecode(req.headers.token);
    let locationUpdate = await getLocationMainUpdate({ user_idx: user_idx, work_idx: work_idx });

    if (locationUpdate.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '변경사항 저장이 실패했습니다.',
        });
    } else {
        cmpanyInfo = await getCompanyInfo({ user_idx: user_idx });

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

router.patch('/withdraw', async (req, res) => {
    let { user_idx } = req.body;

    if (isEmpty(user_idx)) {
        return res.status(400).send(msg.DATA_INVALID);
    }

    let resultWithdraw = await updateUserWithdraw({ user_idx: user_idx });

    if (resultWithdraw.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '탈퇴에 실패했습니다.',
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: '탈퇴 되었습니다.',
            user_idx: user_idx,
            del_yn: 'Y',
        });
    }
});

router.patch('/approve', async (req, res) => {
    let { user_idx, user_state } = req.body;

    if (isEmpty(user_idx)) {
        return res.status(400).send(msg.DATA_INVALID);
    }

    let resultApprove = await updateUserApprove({ user_idx: user_idx, user_state: user_state });

    if (resultApprove.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '실패했습니다.',
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: '완료 됐습니다.',
            user_idx: user_idx,
            user_state: user_state,
        });
    }
});

module.exports = router;
