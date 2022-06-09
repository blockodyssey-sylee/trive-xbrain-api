const { query } = require('../../config');
const { removeLastComma, isEmpty } = require('../../common');

const getUserDocument = async (obj) => {
    let { user_idx, work_idx } = obj;

    let sql = ` 
    SELECT 
        privacy_yn, pledge_yn, edu_yn, ( case when img_question IS NULL then 'N' else 'Y' end) as question_yn,
        img_question, pledge_hat, pledge_boots, pledge_leg, pledge_belt, pledge_glasses, pledge_etc, edu_lecture, edu_visual, edu_training, edu_etc
    FROM
        TB_USER_DOCUMENT
    WHERE
        user_idx = '${user_idx}'
        AND work_idx = '${work_idx}'
    `;

    return query(sql);

    // return {
    //     data : await query(sql)
    // };
};

const documentImgUpdate = async (obj) => {
    let { user_idx, work_idx, img_question } = obj;

    let sql = ` UPDATE TB_USER_DOCUMENT SET
                    img_question = '${img_question}'
                WHERE
                    user_idx = '${user_idx}'
                    AND work_idx = '${work_idx}'
`;

    return query(sql);
};

const getWorkVisitImgCount = async (obj) => {
    let { work_visit_idx, work_visit_img_type } = obj;

    let sql = `select count(*) as img_cnt from TB_WORK_VISIT_IMG where work_visit_idx = '${work_visit_idx}' and work_visit_img_type = '${work_visit_img_type}'`;

    return query(sql);
};

const documentUpdate = async (obj) => {
    let {
        user_idx,
        work_idx,
        privacy_yn,
        pledge_hat,
        pledge_boots,
        pledge_leg,
        pledge_belt,
        pledge_glasses,
        pledge_etc,
        edu_lecture,
        edu_training,
        edu_visual,
        edu_etc,
        type,
    } = obj;

    let update_query = '';

    if (!isEmpty(privacy_yn)) {
        update_query += ` privacy_yn='${privacy_yn}', `;
    }
    if (!isEmpty(pledge_hat)) {
        update_query += ` pledge_hat='${pledge_hat}', `;
    }
    if (!isEmpty(pledge_boots)) {
        update_query += ` pledge_boots='${pledge_boots}', `;
    }
    if (!isEmpty(pledge_leg)) {
        update_query += ` pledge_leg='${pledge_leg}', `;
    }
    if (!isEmpty(pledge_belt)) {
        update_query += ` pledge_belt='${pledge_belt}', `;
    }
    if (!isEmpty(pledge_glasses)) {
        update_query += ` pledge_glasses='${pledge_glasses}', `;
    }
    if (!isEmpty(pledge_etc)) {
        update_query += ` pledge_etc='${pledge_etc}', `;
    }
    if (!isEmpty(edu_lecture)) {
        update_query += ` edu_lecture='${edu_lecture}', `;
    }
    if (!isEmpty(edu_training)) {
        update_query += ` edu_training='${edu_training}', `;
    }
    if (!isEmpty(edu_visual)) {
        update_query += ` edu_visual='${edu_visual}', `;
    }
    if (!isEmpty(edu_etc)) {
        update_query += ` edu_etc='${edu_etc}', `;
    }

    if (!isEmpty(type)) {
        if (type == 'privacy') {
            update_query += ` privacy_yn='Y', `;
        } else if (type == 'pledge') {
            update_query += ` pledge_yn='Y', `;
        } else if (type == 'edu') {
            update_query += ` edu_yn='Y', `;
        }
    }

    update_query = removeLastComma(update_query);

    let sql = ` UPDATE TB_USER_DOCUMENT SET 
                    ${update_query} 
                WHERE 
                    user_idx = '${user_idx}' 
                    AND work_idx = '${work_idx}' `;

    return query(sql);
};

module.exports = {
    getUserDocument,
    documentImgUpdate,
    getWorkVisitImgCount,
    documentUpdate,
};
