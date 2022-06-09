require('dotenv').config();

let {PORT,TLSPORT,ORIGIN,S3_HOST,S3_BUCKET,S3_ACCESSKEYID,S3_SECRETACCESSKEY,
    MYSQL_HOST,MYSQL_USER,MYSQL_PASSPORT,MYSQL_PORT,MYSQL_DATABASE} = process.env
//환경
const port      = PORT
const tlsPort   = TLSPORT
const origin    = ORIGIN
//const origin = isProd ? 'https://blockey.co.kr' : 'http://localhost:8080'

//aws
const s3_host = S3_HOST
const aws = require('aws-sdk')
const s3_bucket = S3_BUCKET
aws.config.update({
    accessKeyId     : S3_ACCESSKEYID,
    secretAccessKey : S3_SECRETACCESSKEY
});
const s3 = new aws.S3()

//mysql
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSPORT,
    port: MYSQL_PORT,
    database: MYSQL_DATABASE
});

connection.connect();

const query = (sql,values) => new Promise((resolve, reject) => {
    var today = new Date();   

    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + '-' + month  + '-' + day;
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2); 
    var timeString = hours + ':' + minutes  + ':' + seconds;
    console.log("queryTime :: "+dateString+" "+timeString);
    
    console.log(sql);
    connection.query(sql,values,(err,rows) => {
        err ? reject(err) : resolve(rows)
    })
})

module.exports = {
    s3,
    s3_bucket,
    s3_host,
    port,
    tlsPort,
    connection,
    query,
    origin
}
