// TB_USER 관련 쿼리
const { query } = require('../../config');
const { sqlEscape } = require('../../common.js');

const sendMailLog = async (obj) => {
    let { to_addr, to_nm, from_addr, from_nm, subject, body, send_type, send_yn, reg_id, reg_ip } = obj;

    let sql = `INSERT INTO TB_EMAIL_LOG 
                (to_addr, to_nm, from_addr, from_nm, subject, body, send_type, send_yn, reg_id, reg_ip, reg_dt)
            VALUES 
                ( '${to_addr}', '${to_nm}', '${from_addr}', '${from_nm}',  '${subject}', ${sqlEscape(
        body
    )}, '${send_type}', '${send_yn}', '${reg_id}', '${reg_ip}', now() )`;

    return query(sql);
};

module.exports = {
    sendMailLog,
};
