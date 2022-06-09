const { query } = require('../../config');
//const {removeLastComma} = require('../common');

// 사업자
const getBoardList = async (obj) => {
    let whereQuery = ` WHERE use_yn = 'Y' AND bd_type = 1 AND del_yn = 'N' `;
    let limitQuery = ``;
    let orderByQuery = ``;

    let sql = `SELECT 
                    bd_idx as 'key',    bd_type,
                    subject,            contents,
                    use_yn,             del_yn,
                    date_format(reg_dt, '%Y.%m.%d') as reg_dt,
                    mod_dt
                FROM 
                    TB_BOARD
                ${whereQuery}
                ${orderByQuery}
                ${limitQuery}`;

    let count_sql = `SELECT 
                        count(*) as total_count
                    FROM 
                        TB_BOARD
                    ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

module.exports = {
    getBoardList,
};
