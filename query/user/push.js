const { query } = require('../config');
const { removeLastComma } = require('../common');

const registUserQr = async (obj) => {
    let { user_idx, qr } = obj;

    let sql = `INSERT INTO TB_USER_QR 
                (user_idx, qr, reg_dt)
            VALUES
                ('${user_idx}', '${qr}', now() )`;

    return query(sql);
};

module.exports = {
    getCompany,
    registUserQr,
};
