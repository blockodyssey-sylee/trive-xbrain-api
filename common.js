const multer = require('multer')

const uuid = require('uuid/v4');
const path = require('path')
const fs = require('fs')
const config = require('./config')
const tmp_path = './_tmp/'

const {s3,s3_bucket,s3_host,connection} = config

const mul_uploader = multer({ dest: tmp_path })


//기본 리스트
const defaultList = () => ({ 
    //columns: [],
    dataSource: [],
    info: {
        total   : 0,
        current : 0,
    }
})

//업로드 
const upload = async (file,fold,acl) => {
    let ws = await fs.readFileSync(file.path);
    let key = fold + uuid() + path.extname(file.originalname)

    return await s3.putObject({
        Bucket: s3_bucket, 
        Key: key, 
        Body: ws,
        ACL: acl
    }, async (err, data) =>  {
        if (err){
            console.error("put object error");
        }
        await fs.unlink(file.path, (err2) => {
            if(err2){
                console.log('파일 삭제 실패');
            }
        })
        return data
    });
}

const jwt = require('jsonwebtoken')

const getToken      = obj => jwt.sign(obj,'hajanoplus20210908!',{expiresIn : 60*60*24*365*100})
const tokenDecode   = token => jwt.verify(token,'hajanoplus20210908!', (err,decode) =>  err ? 'INVALID' : decode.idx)
const tokenDecodeUser   = token => jwt.verify(token,'hajanoplus20210908!', (err,decode) =>  err ? 'INVALID' : decode.idx)

const getTokenAdmin      = obj => jwt.sign(obj,'WokerPassAdmin20210908!',{expiresIn : 60*60*24*365*100})
const tokenDecodeAdmin   = token => jwt.verify(token,'WokerPassAdmin20210908!', (err,decode) =>  err ? 'INVALID' : decode.idx)

const messageDefault = () => ({
    status : '',
    message : '',
    data : []
})

const removeLastComma = value => value = value.replace(/,\s*$/, "");

const numberWithCommas = value => value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const sqlEscape = (val) => connection.escape(val    )

const regExp = (value, type) => {
    let userIdCheck = RegExp(/^[A-Za-z0-9_\-]{5,20}$/);
    let cmpnyCdCheck = RegExp(/^[A-Z_-]{3}$/);
    let passwdCheck = RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?]).{8,16}$/);
    // let nickNameCheck = RegExp(/^[가-힣a-zA-Z0-9]{2,10}$/);
    let emailCheck = RegExp(/^[A-Za-z0-9_.-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-]+/);
    let phonNumberCheck = RegExp(/^01[0179][0-9]{7,8}$/);
    let easyNumberCheck = RegExp(/^[0-9]{6}$/);
    let numberCheck = RegExp(/^[0-9]$/);
    let englishCheck = RegExp(/^[a-zA-Z]$/);
    let koreanCheck = RegExp(/^[ㄱ-ㅎ가-힣]$/);

    if(type === 'phone'){
        if(phonNumberCheck.test(value)){
            return true
        } else {
            return false;
        }
    }
    if(type === 'email'){
        if(emailCheck.test(value)){
            return true
        } else {
            return false;
        }
    }
    if(type === 'easy'){
        if(easyNumberCheck.test(value)){
            return true
        } else {
            return false;
        }
    }
}

const isEmpty = (value) => {
    if( value == "" || value == null || value == undefined || value == 'INVALID' || ( value != null && typeof value == "object" && !Object.keys(value).length ) ) {
        return true;
    } else { 
        return false;
    } 
}

const stringDateFormat = (value, type) => {
    const stringDay = new Date(value);

    console.log(value);

    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    // getDay: 해당 요일(0 ~ 6)를 나타내는 정수를 반환한다.
    const day = dayNames[stringDay.getDay()];
    
    console.log("day : "+day);

    let year = stringDay.getFullYear();
    let month = stringDay.getMonth() + 1;
    let date = stringDay.getDate();
    let hour = stringDay.getHours();
    let minute = stringDay.getMinutes();
    let second = stringDay.getSeconds();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // 12시간제로 변경
    // hour %= 12;
    // hour = hour || 12; // 0 => 12

    // 10미만인 분과 초를 2자리로 변경
    month = month < 10 ? '0' + month : month;
    date = date < 10 ? '0' + date : date;
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;

    let now;

    if( type == 1) {
        now = `${year}년 ${month}월 ${date}일 ${day} ${hour}:${minute}:${second} ${ampm}`;
    } else if( type == 2) { // 사업자가 스캔 시 return date format
        now = `${year}년 ${month}월 ${date}일  ${hour}시${minute}분`;
    } else if( type == 3) { // 사업자가 로그인 시 시 return date format
        now = `${year}년 ${month}월 ${date}일 ${day}`;
    } else if( type == 4) { 
        now = `${year}${month}${date}${hour}${minute}${second}`;
    }

    return now;
}


const nima_api = `http://3.34.111.135:3000`;


const blockchain_api = `http://52.78.107.58:3000`;

module.exports = {
    defaultList,
    getToken,
    tokenDecode,
    tokenDecodeUser,
    getTokenAdmin,
    tokenDecodeAdmin,
    messageDefault,
    removeLastComma,
    regExp,
    upload,
    sqlEscape,
    mul_uploader,
    nima_api,
    blockchain_api,
    isEmpty,
    stringDateFormat,
    numberWithCommas
}
