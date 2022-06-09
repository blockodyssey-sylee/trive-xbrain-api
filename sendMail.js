const nodemailer = require('nodemailer');
const moment = require('moment');
const { sendMailLog } = require('./query/user/mail');

moment.locale('ko');

let { MAIL_USER, MAIL_PASSWORD } = process.env;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
    },
});

let mailCode = {
    BP1: {
        subject: '[WorkerPass] 방문현황 입니다.',
        txt: '방문 현황 메일로 전달 드립니다.',
        s1: '아이디',
        s2: '비밀번호',
        s3: '등록일',
        link: 'https://equals.blockodyssey.io/',
        link_text: '관리자페이지 바로가기',
    },
    A01: {
        subject: '[WorkerPass] 주문이 접수되었습니다.',
        txt: '새로운 주문이 도착하였습니다. 주문정보는 아래와 같습니다.',
        s1: '회사명',
        s2: '아이디',
        s3: '주문일',
        link: 'https://equals.blockodyssey.io/order',
        link_text: '주문관리 바로가기',
    },
};

const sendMail = (obj) => {
    let mailOptions = {
        from: '"[WorkerPass]" <noreply@blockodyssey.io>',
        to: obj.to_email,
        subject: mailCode[obj.code].subject,
        html: `<div style="background-color : #F1F1F1; padding : 20px 0;">
        <div style="width:740px; height:732px; margin:20px auto 20px auto; ">
          <div style="width:680px; height:532px; background:#fff; padding:30px 30px 60px 30px; margin:0; border-top-left-radius: 8px; -webkit-border-top-left-radius: 8px; -moz-border-top-left-radius: 8px; border-top-right-radius: 8px; -webkit-border-top-right-radius: 8px; -moz-border-top-right-radius: 8px; border-bottom-left-radius: 0; -webkit-border-bottom-left-radius: 0; -moz-border-bottom-left-radius: 0; border-bottom-right-radius: 0; -webkit-border-bottom-right-radius: 0; -moz-border-bottom-right-radius: 0; ">
            <h1 style="border-bottom:2px #1C1C1C solid; padding:0 0 10px 0; margin:0; ">
            <a href="http://blockodyssey.io/" target="_blank" rel="noreferrer noopener">
            <img src="http://home.blockodyssey.io/mail/bp_img_logo_email@2x.png" alt="Block Odyssey" style="width:160px;" loading="lazy">
            </a>
            </h1>
            <div style="padding:50px 0 120px 0;">
              <p style="color:#000; font-family: 'Noto Sans KR', sans-serif; font-weight:normal; font-size:15px; letter-spacing:-0.75px; line-height:28px; padding:0; margin:0; ">
                <span style="color:#333333; font-family: 'Noto Sans KR', sans-serif; font-weight:500;">안녕하세요. 블록패스입니다.</span>
              </p>
              <p style="color:#000; font-family: 'Noto Sans KR', sans-serif; font-weight:normal; font-size:15px; letter-spacing:-0.75px; line-height:28px; padding:0; margin:0; ">
                <span style="color:#0857C3; font-family: 'Noto Sans KR', sans-serif; font-weight:bold;">${obj.from_nm}</span><span style="color:#333333; font-family: 'Noto Sans KR', sans-serif; font-weight:500;">님의 방문자 기록을 전달합니다.</span>
              </p>
              <div style="border:1px #EFEFEF solid; margin:40px 0 40px 0; padding:30px; height:100px; background:#FAFAFA 0% 0% no-repeat padding-box;">
                <div style="float:left; width:50%;">
                  <div style="float:center; width:100%;">
                    <ul style="overflow:hidden; padding:0; margin:0; text-align:center;">
                      <li style="list-style:none; padding:0; margin:20 0; text-align:center;border-right: 1px solid #D9D9D9;opacity: 1;">
                      <dl style="overflow:hidden; padding:0; margin:10;">
                        <dt style="color:#4c4c4c; font-family: 'Noto Sans KR', sans-serif; font-weight:normal; font-size:13px; letter-spacing:-0.3px; padding:0; margin:0;">총 방문자</dt>
                        <dd style="color:#000; font-family: 'Noto Sans KR', sans-serif; font-weight:bold; font-size:19px; letter-spacing:-0.5px; line-height:32px; padding:0; margin:0;">${obj.total_count}명</dd>
                      </dl>
                      </li>
                    </ul>
                  </div>
                </div>
                <div style="float:right;width:50%;">
                  <div style="float:center; width:100%;">
                    <ul style="overflow:hidden; padding:0; margin:0; text-align:center;">
                      <li style="list-style:none; padding:0; margin:20 0; text-align:center;">
                      <dl style="overflow:hidden; padding:0; margin:10;">
                        <dt style="color:#4c4c4c; font-family: 'Noto Sans KR', sans-serif; font-weight:normal; font-size:13px; letter-spacing:-0.3px; padding:0; margin:0;">방문일시</dt>
                        <dd style="color:#000; font-family: 'Noto Sans KR', sans-serif; font-weight:bold; font-size:19px; letter-spacing:-0.5px; line-height:32px; padding:0; margin:0;">${obj.s_date}~${obj.e_date}</dd>
                      </dl>
                    </ul>
                  </div>
                </div>
              </div>
              
              <a style="text-align: center;font-family: 'Noto Sans KR', sans-serif; font-weight:normal; font-size:12px; text-decoration:none !important;" href="${obj.excelLink}" target="_blank">
              <button style="letter-spacing:-1.25px; padding: 10px;width: 160px;height: 45px;background: #FFFFFF65 0% 0% no-repeat padding-box;border: 1px solid #D9D9D9;border-radius: 4px;opacity: 1;text-align:center; text-decoration:none !important;" onclick="window.open('${obj.excelLink}')">
              방문기록 파일 다운로드
              </button>
              </a>
            </div>
          </div>
          <div style="width:680px; height:70px; background:#1C1C1C; padding:30px 30px 30px 30px; overflow:hidden; margin:0; border-top-left-radius: 0; -webkit-border-top-left-radius: 0; -moz-border-top-left-radius: 0; border-top-right-radius: 0; -webkit-border-top-right-radius: 0; -moz-border-top-right-radius: 0; border-bottom-left-radius: 8px; -webkit-border-bottom-left-radius: 8px; -moz-border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; -webkit-border-bottom-right-radius: 8px; -moz-border-bottom-right-radius: 8px;">
            <div style="float:left; padding:0; margin:0;width:680px;">
              <p style="padding:0; margin:0; color:#fff; font-family: 'Noto Sans KR', sans-serif; font-weight:bold; font-size:17px; letter-spacing:-0.5px; line-height:32px;">
                 (주)블록오디세이
              </p>
              <ul style="overflow:hidden; padding:0; margin:0;">
                <li style="float:left; padding:0; margin:0; list-style:none; color: rgba(255, 255, 255, 0.7); font-family: 'Noto Sans KR', sans-serif; font-weight:100; font-size:13px; line-height:22px;">
                전화번호 02-2088-6042 </li>
                <li style="float:left; width:1px; list-style:none; height:12px; background:rgba(255, 255, 255, 0.2); margin:5px 10px 0 10px; padding:0;"></li>
                <li style="float:left; padding:0; margin:0; list-style:none; color: rgba(255, 255, 255, 0.7); font-family: 'Noto Sans KR', sans-serif; font-weight:100; font-size:13px; line-height:22px;">
                <a href="mailto:help@blockodyssey.io" title="help@blockodyssey.io" style="text-decoration: blink; color: rgba(255, 255, 255, 0.7);" rel="noreferrer noopener" target="_blank">
                이메일 help@blockodyssey.io </a>
                </li>
                <li style="float:right;padding-left:10px;">
                <a target="_blank" href="https://www.instagram.com/blockodyssey" rel="noreferrer noopener">
                <img src="http://home.blockodyssey.io//_img/ic_instar_nor@2x.png" alt="instagram" width="40px" height="40px;" loading="lazy">
                </a>
                </li>
                <li style="float:right;padding-left:10px;">
                <a target="_blank" href="https://www.facebook.com/BlockodysseyBlcokchain" rel="noreferrer noopener">
                <img src="http://home.blockodyssey.io//_img/ic_face_nor@2x.png" alt="facebook" width="40px" height="40px;" loading="lazy">
                </a>
                </li>
                <li style="float:right;padding-left:10px;">
                <a target="_blank" href="https://blog.naver.com/blockodyssey" rel="noreferrer noopener">
                <img src="http://home.blockodyssey.io//_img/ic_blog_nor@2x.png" alt="Blog" width="40px" height="40px;" loading="lazy">
                </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
`,
    };
    //console.log(obj)
    // send mail with defined transport object

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        } else {
            let log_obj = {
                from_nm: 'WorkerPass',
                from_addr: MAIL_USER,
                to_nm: obj.to_nm,
                to_addr: obj.to_email,
                subject:
                    obj.from_nm +
                    '(' +
                    obj.from_email +
                    ') 방문현황 발송 ' +
                    obj.day_type +
                    ' ' +
                    obj.s_date +
                    '~' +
                    obj.e_date,
                body: mailOptions.html,
                reg_id: info.messageId,
                reg_ip: obj.user_ip,
                send_type: obj.code,
                send_yn: 'Y',
            };
            sendMailLog(log_obj);
        }
        /*
        to_email : to_email,
        to_nm : to_nm,
        code : 'BP1',
        from_email : email,
        from_nm : findResult[0].cmpny,
        s_date : s_date,
        e_date : e_date,
        day_type : day_type,
        excelLink : excelLink
        (to_addr, to_nm, from_addr, from_nm, subject, body, send_type, send_yn, reg_id, reg_ip, reg_dt)
        */
    });
};

module.exports = {
    sendMail,
};
