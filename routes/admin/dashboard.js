const express = require('express');
const moment = require('moment');
const router = express.Router();
const { getToken, getTokenAdmin, tokenDecode, isEmpty, regExp, removeLastComma, upload, mul_uploader } = require('../../common');
const { getDashboardScan, getDashboardJoin } = require('../../query/admin/dashboard');

router.get('/', async (req, res) => {
    let { date } = req.query;
    let obj = { date };

    let findResult = await getDashboardScan(obj);

    let dataSource = [];
    let dashArr = [];

    for (i = 0; i < findResult.info.total; i++) {
        dashArr.push(findResult.dataSource[i].scan_count);
    }

    if (findResult.affectedRows != 0) {
        return res.status(200).json({
            status: 'success',
            dashArr,
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
