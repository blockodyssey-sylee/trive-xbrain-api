const express = require('express');
const moment = require('moment');
const router = express.Router();
const { getToken, getTokenAdmin, tokenDecode, isEmpty, regExp, removeLastComma, upload, mul_uploader } = require('../../common');
const { getDashboardScan, getDashboardJoin } = require('../../query/admin/dashboard');
const { getTriveCarList } = require('../../query/admin/carlist');


router.get('/', async (req, res) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order } = req.query;
    let obj = { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order };

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

    let findResult = await getTriveCarList(obj);

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
