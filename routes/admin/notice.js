const express = require('express');
const moment = require('moment');
const router = express.Router();
const { getToken, getTokenAdmin, tokenDecode, isEmpty, regExp, removeLastComma, upload, mul_uploader } = require('../../common');
const { getNoticeList, getNoticeDetail, registNotice, updateNotice, getNoticeDelete, getPrivacyTerm, updatePrivacyTerm } = require('../../query/admin/notice');
const { getAdminInfo } = require('../../query/admin/member');

router.get('/', async (req, res) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order } = req.query;
    let obj = { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order };

    //console.log(admin_idx+" : "+admin_nm+" : "+admin_email);

    let findResult = await getNoticeList(obj);

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
    let { bd_idx } = req.query;
    let obj = { bd_idx };
    //console.log(admin_idx+" : "+admin_nm+" : "+admin_email);
    //console.log(bd_idx);

    let findResult;

    findResult = await getNoticeDetail(obj);

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            dataSource: {
                bd_idx: findResult[0].bd_idx,
                subject: findResult[0].subject,
                contents: findResult[0].contents,
                use_yn: findResult[0].use_yn,
                del_yn: findResult[0].del_yn,
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
});

router.post('/', async (req, res) => {
    let { subject, contents, admin_idx } = req.body;

    let token = '';

    if (isEmpty(subject) || isEmpty(contents) || isEmpty(admin_idx)) {
        return res.status(400).send(msg.DATA_INVALID);
    }

    let obj = { subject, contents, admin_idx };

    let findResult = await getAdminInfo({ admin_idx: admin_idx });

    obj.admin_email = findResult[0].admin_email;

    // console.log(findResult);
    // console.log(findResult[0]);
    // console.log(isEmpty(findResult));
    // console.log(obj);

    if (!isEmpty(findResult)) {
        let registResult = await registNotice(obj);

        findResult = await getNoticeDetail({ bd_idx: registResult.insertId });

        if (registResult.affectedRows == 0) {
            return res.status(409).send(msg.CONFLICT);
        } else {
            return res.status(201).send({
                message: '공지사항 등록 되었습니다.',
                dataSource: {
                    bd_idx: findResult[0].bd_idx,
                    subject: findResult[0].subject,
                    contents: findResult[0].contents,
                    use_yn: findResult[0].use_yn,
                    del_yn: findResult[0].del_yn,
                    reg_dt: findResult[0].reg_dt,
                },
            });
        }
    } else {
        return res.status(403).send({
            message: '공지사항 등록 중 오류가 발생했습니다.',
        });
    }
});

router.put('/', async (req, res) => {
    let { subject, contents, bd_idx, admin_idx } = req.body;

    let token = '';

    if (isEmpty(subject) || isEmpty(contents) || isEmpty(bd_idx)) {
        return res.status(400).send(msg.DATA_INVALID);
    }

    let obj = { subject, contents, bd_idx, admin_idx };

    let findResult = await getAdminInfo({ admin_idx: admin_idx });

    obj.admin_email = findResult[0].admin_email;

    // console.log(findResult);
    // console.log(obj);

    if (!isEmpty(findResult)) {
        let updateResult = await updateNotice(obj);

        findResult = await getNoticeDetail({ bd_idx: bd_idx });

        if (updateResult.affectedRows == 0) {
            return res.status(409).send(msg.CONFLICT);
        } else {
            return res.status(201).send({
                message: '공지사항 수정 되었습니다.',
                dataSource: {
                    bd_idx: findResult[0].bd_idx,
                    subject: findResult[0].subject,
                    contents: findResult[0].contents,
                    use_yn: findResult[0].use_yn,
                    del_yn: findResult[0].del_yn,
                    reg_dt: findResult[0].reg_dt,
                },
            });
        }
    } else {
        return res.status(403).send({
            message: '공지사항 수정 중 오류가 발생했습니다.',
        });
    }
});

router.put('/delete', async (req, res) => {
    let { bd_idx } = req.body;
    let obj = { bd_idx };

    let updateResult = await getNoticeDelete(obj);

    if (updateResult.affectedRows == 0) {
        return res.status(409).send(msg.CONFLICT);
    } else {
        return res.status(201).send({
            message: '공지사항 삭제 되었습니다.',
        });
    }
});

router.get('/privacyTerm', async (req, res) => {
    let findResult;

    let privacyResult = await getPrivacyTerm({ bd_type: 2 });
    let termResult = await getPrivacyTerm({ bd_type: 3 });

    if (privacyResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            privacy: privacyResult[0].contents,
            term: termResult[0].contents,
        });
    } else {
        return res.status(400).send({
            status: 'success',
            message: '조회되는 데이터가 없습니다.',
            dataSource,
        });
    }
});

router.put('/privacyTerm', async (req, res) => {
    let { privacy, term } = req.body;
    let obj = { privacy, term };

    await updatePrivacyTerm({ bd_type: 2, contents: privacy });
    await updatePrivacyTerm({ bd_type: 3, contents: term });

    let privacyResult = await getPrivacyTerm({ bd_type: 2 });
    let termResult = await getPrivacyTerm({ bd_type: 3 });

    if (privacyResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            privacy: privacyResult[0].contents,
            term: termResult[0].contents,
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
