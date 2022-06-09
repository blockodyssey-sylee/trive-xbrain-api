const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getTriveCarList = async (obj) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order } = obj;

// car_id, car_trim_id, car_vin, car_description, car_offered_price, car_plate_number, car_model_year, current_mileage, color_group, color_maker, current_datetime

    let whereQuery = ` WHERE current_datetime IS NOT NULL `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( car_vin LIKE '%${searchKeyword}%' OR 
                                  car_description LIKE '%${searchKeyword}%' OR 
                                  car_plate_number LIKE '%${searchKeyword}%' OR 
                                  car_model_year LIKE '%${searchKeyword}%' ) `;
        }
        if (searchType === 'car_vin') {
            whereQuery += ` AND car_vin LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'car_description') {
            whereQuery += ` AND car_description LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'car_plate_number') {
            whereQuery += ` AND car_plate_number LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'car_model_year') {
            whereQuery += ` AND car_model_year LIKE '%${searchKeyword}%'`;
        }
    }

    if (startDate) {
        whereQuery += ` AND current_datetime >= '${startDate} 00:00:00'`;
    }
    if (endDate) {
        whereQuery += ` AND current_datetime <= '${endDate} 23:59:59'`;
    }

    if (pageNumber) {
        pageNumber = pageNumber - 1;
        if (pageShow) {
            pageNumber = pageNumber * pageShow;
        } else {
            pageNumber = pageNumber * 10;
        }
        limitQuery += ` LIMIT ${pageNumber}, ${pageShow}`;
    } else {
        limitQuery += ` LIMIT 0, 10`;
    }

    if (sort_nm) {
        if (sort_order) orderByQuery += ` ORDER BY ${sort_nm} ${sort_order}`;
    } else {
        orderByQuery += `ORDER BY current_datetime DESC, car_model_year DESC `;
    }

    let sql = ` 
SELECT
    car_id, car_trim_id, car_vin, car_description, car_offered_price, car_plate_number, car_model_year, current_mileage, color_group, color_maker, 
    DATE_FORMAT(current_datetime, '%Y-%m-%d %H:%i:%S') as current_datetime
FROM 
    TB_CAR as tc
${whereQuery} 
${orderByQuery} 
${limitQuery} 
`;

    let count_sql = `SELECT COUNT(*) as total_count FROM TB_CAR as ta  ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};



module.exports = {
    getTriveCarList,
};
