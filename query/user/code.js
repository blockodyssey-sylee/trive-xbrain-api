const { query } = require('../../config');
const { removeLastComma, isEmpty } = require('../../common');

const updateManagerCode = async (obj) => {
    let { user_idx, user_code } = obj;

    let sql = ` UPDATE TB_USER SET user_code = '${user_code}' WHERE user_idx = '${user_idx}' AND type='W' `;

    return query(sql);
};

const updateAdminCode = async (obj) => {
    let { user_idx, admin_code } = obj;

    let sql = ` UPDATE TB_USER SET admin_code = '${admin_code}' WHERE user_idx = '${user_idx}' AND type='M' `;

    return query(sql);
};

const getWorkAdminInfo = async (obj) => {
    let { user_idx } = obj;

    let sql = ` SELECT work_idx, admin_idx, work_nm FROM TB_WORK WHERE admin_idx = (
                    SELECT admin_idx FROM TB_ADMIN WHERE admin_code = (
                        SELECT reg_admin_code FROM TB_ADMIN WHERE admin_code = (
                                SELECT admin_code FROM TB_USER WHERE user_idx='${user_idx}' AND type='M'
                        )
                    )
                ) `;

    return query(sql);
};

const getWorkInfo = async (obj) => {
    let { admin_code } = obj;

    let sql = ` SELECT work_idx, admin_idx, work_nm FROM TB_WORK WHERE admin_idx = (
                    SELECT admin_idx FROM TB_ADMIN WHERE admin_code = (
                        SELECT reg_admin_code from TB_ADMIN WHERE admin_code = '${admin_code}' 
                    )
                ) `;

    return query(sql);
};

const insertUserDocument = async (obj) => {
    let { user_idx, work_idx } = obj;

    let sql = ` INSERT INTO TB_USER_DOCUMENT ( user_idx, work_idx ) VALUES ( '${user_idx}', '${work_idx}' )`;

    return query(sql);
};

const selectUserDocumentCount = async (obj) => {
    let { user_idx, work_idx } = obj;

    let sql = ` SELECT COUNT(*) as total_count FROM TB_USER_DOCUMENT WHERE user_idx = '${user_idx}' AND work_idx = '${work_idx}' `;

    return query(sql);
};

const signatureImgUpdate = async (obj) => {
    let { user_idx, img_signature } = obj;

    let sql = ` UPDATE TB_USER SET img_signature = '${img_signature}' WHERE user_idx = '${user_idx}' `;

    return query(sql);
};

const getAdminInfo = async (obj) => {
    let { admin_idx } = obj;

    let sql = ` SELECT 
                    admin_level, admin_code, admin_email, admin_phone, admin_nm, admin_cmpny_nm, admin_part
                FROM 
                    TB_ADMIN  
                WHERE
                    admin_idx='${admin_idx}'
`;

    return query(sql);
};

module.exports = {
    updateManagerCode,
    updateAdminCode,
    getWorkAdminInfo,
    getWorkInfo,
    insertUserDocument,
    selectUserDocumentCount,
    signatureImgUpdate,
    getAdminInfo,
};
