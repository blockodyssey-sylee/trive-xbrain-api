const http = require('http');
const fs = require('fs');
const https = require('https');
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');

const session = require('express-session');	//세션관리용 미들웨어
const fileStore = require('session-file-store')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// const admin = require('firebase-admin');
// const serviceAccount = require('./worker-pass-firebase-pushkey.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://hajano.firebaseio.com"
// });


const adminRoutes = require('./routes/admin');
const admin_mw = require('./middleware/admin_mw')

const app = express();


const {port,tlsPort} = require('./config')
const msg = require('./message')

const httpServer  = http.createServer(app);
//const httpsServer = https.createServer(options, app);
httpServer.listen(port,()=> console.log(port));
//httpsServer.listen(tlsPort,()=> console.log(tlsPort));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const corsOptions = {
    //To allow requests from client
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1",
        "http://workpass.blockodyssey.io",
        "http://workpass-api-dev.blockodyssey.io",
        "https://workpass.blockodyssey.io",
        "https://workpass-api-dev.blockodyssey.io"
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  };
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/admin',admin_mw)
for (let n in adminRoutes) {
  app.use('/admin/' + n, cors(corsOptions), adminRoutes[n])
}

app.use(function(req, res, next) {
  res.status(404).send(msg.NOT_FOUND);
});

app.use(session({
    httpOnly: true,	//자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
    secure: true,	//https 환경에서만 session 정보를 주고받도록 처리
    secret: 'secret key',	//암호화하는 데 쓰일 키
    resave: false,	//세션을 언제나 저장할지 설정함
    saveUninitialized: true,	//세션이 저장되기 전 uninitialized 상태로 미리 만들어 저장
    cookie: {	//세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
      httpOnly: true,
      secure: true,
      sameSite : 'none'
    },
    store: new fileStore()
}));


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}); 