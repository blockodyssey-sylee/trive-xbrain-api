const express = require('express');
const router = express.Router();
const sha256 = require('sha256');
const msg = require('../../message');
const { s3_host, s3_bucket } = require('../../config');
const { getLogin } = require('../../query/user/login');
const { getCompanyInfo } = require('../../query/user/login');
const {
    insertLocation,
    getLocationInfo,
    getLocationUpdate,
    getLocationList,
    getLocationMainUpdate,
    getLocationCount,
    getWorkList,
    getWorkNmList,
    getWorkDetail,
    getBeforeAfterImage,
    getExcelList,
    getQrList,
} = require('../../query/admin/work');
const { getEvaluateUpdate } = require('../../query/user/visit');
const { getAdminInfo } = require('../../query/admin/member');
const { getToken, tokenDecode, isEmpty, regExp, stringDateFormat, upload, mul_uploader } = require('../../common');
const { find } = require('async');
const Excel = require('exceljs');

router.post('/', mul_uploader.fields([{ name: 'work_img', maxCount: 1 }]), async (req, res) => {
    let { work_nm, work_addr, work_num } = req.body;

    if (isEmpty(work_nm)) {
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

    if (isEmpty(user_idx)) {
        return res.status(402).send({
            status: 'fail',
            message: '회원 idx가 필요합니다.',
        });
    }

    let findResult = await getLocationInfo({
        user_idx: user_idx,
        work_nm: work_nm,
    });

    if (isEmpty(findResult)) {
        let { files } = req;
        let fileImgs = files.work_img;
        let work_idx_;
        if (fileImgs) {
            uploaded_img = await upload(fileImgs[0], `upload/location/`, 'public-read');
            let insertLocation_ = await insertLocation({
                user_idx: user_idx,
                work_nm: work_nm,
                work_img: `${s3_host}/${s3_bucket}${uploaded_img.httpRequest.path}`,
                work_addr: work_addr,
                work_num: work_num,
            });
            work_idx_ = insertLocation_.insertId;
        } else {
            let insertLocation_ = await insertLocation({
                user_idx: user_idx,
                work_nm: work_nm,
                work_img: '',
                work_addr: work_addr,
                work_num: work_num,
            });
            work_idx_ = insertLocation_.insertId;
        }

        let locationCountndResult = await getLocationCount({
            user_idx: user_idx,
        });

        if (locationCountndResult[0].cnt == 0) {
            await getLocationMainUpdate({
                user_idx: user_idx,
                work_idx: work_idx_,
            });
        }

        let cmpanyInfo = await getCompanyInfo({ user_idx: user_idx });

        return res.status(200).send({
            status: 'success',
            message: '작업현장 등록이 완료되었습니다.',
            dataSource: {
                work_idx: work_idx_,
                work_nm: cmpanyInfo[0].work_nm,
                today: stringDateFormat(cmpanyInfo[0].today, 3),
                visit_cnt: cmpanyInfo[0].visit_cnt,
            },
        });
    } else {
        return res.status(400).send({
            status: 'fail',
            message: '이미 등록된 작업현장 입니다.',
        });
    }
});

router.get('/excelDown', async (req, res, next) => {
    try {
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

        let findResult = await getExcelList(obj);

        let total_count = findResult.count[0].total_count;
        let getResult = findResult.data;

        if (findResult.affectedRows != 0) {
            if (total_count > 0) {
                const workbook = new Excel.Workbook();
                const sheet = workbook.addWorksheet('WorkList');

                sheet.columns = [
                    { header: '작업자', key: 'worker_nm' },
                    { header: '관리자', key: 'manager_nm' },
                    { header: '등록일', key: 'visit_dt' },
                    { header: '작업장명', key: 'work_nm' },
                    { header: '내용', key: 'work_content' },
                    { header: '평가', key: 'evaluate_content' },
                ];

                let getExcel;
                for (let i = 0; i < total_count; i++) {
                    getExcel = getResult[i];

                    sheet.addRow({
                        worker_nm: getExcel.worker_nm,
                        manager_nm: getExcel.manager_nm,
                        visit_dt: getExcel.visit_dt,
                        work_nm: getExcel.work_nm,
                        work_content: getExcel.work_content,
                        evaluate_content: getExcel.evaluate_content,
                    });
                }
                now_time = new Date();
                let fileName = 'workList_' + stringDateFormat(now_time, 4) + '.xlsx';
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                await workbook.xlsx.write(res);
                res.end();
            } else {
                return res.status(400).send({
                    status: 'error',
                    message: '조회되는 데이터가 없습니다.',
                });
            }
        } else {
            return res.status(400).send({
                status: 'success',
                message: '조회되는 데이터가 없습니다.',
                dataSource,
            });
        }
    } catch (err) {
        console.log(err);
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
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let findResultLogin = await getAdminInfo({ admin_idx: req.session.idx });
    obj.login_admin_code = findResultLogin[0].admin_code;
    obj.login_admin_nm = findResultLogin[0].admin_nm;
    obj.login_admin_level = findResultLogin[0].admin_level;
    obj.login_admin_idx = findResultLogin[0].admin_idx;

    let findResult = await getWorkList(obj);

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
    let { work_visit_idx } = req.query;
    let obj = { work_visit_idx };

    let findResult = await getWorkDetail(obj);

    let dataSource = [];

    before_image = await getBeforeAfterImage({
        work_visit_idx: work_visit_idx,
        work_visit_img_type: 'B',
    });
    after_image = await getBeforeAfterImage({
        work_visit_idx: work_visit_idx,
        work_visit_img_type: 'A',
    });

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            dataSource: {
                work_visit_idx: findResult[0].work_visit_idx,
                work_idx: findResult[0].work_idx,
                worker_nm: findResult[0].worker_nm,
                manager_nm: findResult[0].manager_nm,
                visit_dt: findResult[0].visit_dt,
                qr_memo: findResult[0].qr_memo,
                work_nm: findResult[0].work_nm,
                work_content: findResult[0].work_content,
                evaluate_content: findResult[0].evaluate_content,
                evaluate_state: findResult[0].evaluate_state,
                evaluate_dt: findResult[0].mod_dt,
                proficiency: findResult[0].proficiency,
                sincerity: findResult[0].sincerity,
                worker_accident: findResult[0].worker_accident,
                accident: findResult[0].accident,
                before_image: before_image,
                after_image: after_image,
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

router.put('/evaluate', async (req, res) => {
    let { work_visit_idx, proficiency, sincerity, accident, evaluate_content } = req.body;
    let obj = {
        work_visit_idx,
        proficiency,
        sincerity,
        accident,
        evaluate_content,
    };

    if (isEmpty(work_visit_idx)) {
        return res.status(400).send(msg.DATA_INVALID);
    }

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

    let ealuateUpdate = await getEvaluateUpdate(obj);

    if (ealuateUpdate.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '평가 저장이 실패했습니다.',
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: '평가가 저장 되었습니다.',
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
    let user_idx = tokenDecode(req.headers.token);
    let locationUpdate = await getLocationMainUpdate({
        user_idx: user_idx,
        work_idx: work_idx,
    });

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

router.delete('/', async (req, res) => {
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

    let locationUpdate = await getLocationUpdate({ work_idx: work_idx });

    if (locationUpdate.affectedRows == 0) {
        return res.status(400).json({
            status: 'fail',
            message: '삭제에 실패했습니다.',
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: '삭제 되었습니다.',
        });
    }
});

router.get('/workNm', async (req, res) => {
    let {} = req.query;
    let obj = {};

    let admin_idx = req.session.idx;
    let admin_nm = req.session.name;
    let admin_email = req.session.email;

    let findResult = await getWorkNmList(obj);

    let dataSource = [];
    let total_count = findResult.count[0].total_count;
    let getResult = findResult.data;

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
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

router.get('/qrList', async (req, res) => {
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
    } else {
        return res.status(401).send({
            status: 'fail',
            message: '세션이 끊겼습니다. 로그인이 필요합니다.',
        });
    }

    let admin_idx = req.session.idx;
    let admin_nm = req.session.name;
    let admin_email = req.session.email;

    let cmpnyResult = await getAdminInfo({ admin_idx: req.session.idx });

    obj.admin_code = cmpnyResult[0].admin_code;

    let findResult = await getQrList(obj);

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

module.exports = router;
