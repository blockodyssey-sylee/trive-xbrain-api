const { query } = require('../../config');
const { initLimit, initDate, initSearch } = require('./common');

const getList = async (obj) => {
    let table = '';
    let columns = '';
    let whereQuery = '';

    table = `
  FROM TB_USER_QR a
  LEFT JOIN TB_USER b
  ON (a.user_idx = b.user_idx)
  `;
    columns = `a.qr as 'key', b.user_cd, b.nm, b.gender, b.phone, a.visit_dt as 'reg_dt'`;
    whereQuery = `
    WHERE a.visit_dt IS NOT NULL
    AND ${initDate(obj, 'a.visit_dt')}
    ${obj.keyword ? 'AND' : ''} ${initSearch(obj, ['b.user_cd', 'b.nm', 'b.phone'])}
  `;
    // whereQuery = `WHERE use_yn = 'Y' AND email = '${id}' AND pw = '${pw}' `;

    let sql = `
              SELECT 
              ${columns} 
              ${table}
              ${whereQuery}
              ORDER BY a.visit_dt DESC
              ${initLimit(obj)}
            `;
    let total = await query(
        `
    SELECT COUNT(*) num 
    ${table}
    ${whereQuery}
    `
    );

    const result = {
        dataSource: await query(sql),
        info: {
            total: total[0].num,
        },
    };

    return result;
};

module.exports = {
    getList,
};
