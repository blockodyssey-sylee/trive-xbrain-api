const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getNowVersion = async (obj) => {
    let { cd_key } = obj;

    let sql = ` SELECT cd_key, cd_val, cd_nm, cd_sort, comment FROM TB_CODE WHERE cd_key='${cd_key}' `;

    return query(sql);
};

module.exports = {
    getNowVersion,
};
