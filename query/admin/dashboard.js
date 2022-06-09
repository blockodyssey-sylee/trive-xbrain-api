const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getDashboardScan = async (obj) => {
    let { date } = obj;

    let s_date = date + '-01';
    let e_date = date + '-31';

    let sql = ` 
    SELECT 
        (case when scan_count IS NOT NULL then scan_count ELSE 0 END ) AS scan_count
    FROM V_DATE_LIST_BY_DAY AS v
    LEFT JOIN 
        ( 
            SELECT SUM(scan_count) AS scan_count, scan_day FROM (
                SELECT 
                    1 AS scan_count, date_format(visit_dt, '%Y-%m-%d') AS scan_day
                FROM 
                    TB_WORK_VISIT
                WHERE 
                    visit_dt >= '${s_date}' AND visit_dt <= '${e_date}'
            ) AS a
            GROUP BY scan_day 
        ) AS b 
        ON b.scan_day = v.DATE
    WHERE v.DATE >= '${s_date}' AND v.DATE <= '${e_date}'
    ORDER BY v.DATE ASC
    `;

    let total = await query(
        `
    SELECT
        COUNT(v.DATE) as num
    FROM 
        V_DATE_LIST_BY_DAY AS v
    WHERE
        v.DATE >= '${s_date}' AND v.DATE <= '${e_date}'
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

const getDashboardJoin = async (obj) => {
    let { date, user_type } = obj;

    let s_date = date + '-01';
    let e_date = date + '-31';

    let sql = ` 
    SELECT 
        (case when join_count IS NOT NULL then join_count ELSE 0 END ) AS join_count
    FROM 
        V_DATE_LIST_BY_DAY AS v
    LEFT JOIN 
        ( SELECT SUM(join_count) AS join_count, reg_dt FROM (
                SELECT 
                    1 AS join_count, date_format(reg_dt, '%Y-%m-%d') AS reg_dt
                FROM TB_USER
                WHERE reg_dt >= '${s_date}' AND reg_dt <= '${e_date}' and type='${user_type}'
            ) AS a
            GROUP BY reg_dt 
        ) AS b ON b.reg_dt = v.DATE
    WHERE v.DATE >= '${s_date}' AND v.DATE <= '${e_date}'
    ORDER BY v.DATE ASC
    `;

    let total = await query(
        `
    SELECT
        COUNT(v.DATE) as num
    FROM 
        V_DATE_LIST_BY_DAY AS v
    WHERE
        v.DATE >= '${s_date}' AND v.DATE <= '${e_date}'
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
    getDashboardScan,
    getDashboardJoin,
};
