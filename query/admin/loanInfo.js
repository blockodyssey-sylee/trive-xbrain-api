const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getLoanInfo = async () => {    

    let sql = ` 
SELECT 
    cmpny_nm, sector, founding_dt, address, investment, investor, credit_rating, amount, term, interest_rate, repayment, other_info
FROM 
    TB_LOAN_INFORMATION
`;

    return {
        data: await query(sql)
    };
};



module.exports = {
    getLoanInfo,
};
