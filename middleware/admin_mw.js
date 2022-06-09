const express = require('express');
const router = express.Router();
const { getToken, tokenDecode } = require('./../common');
const msg = require('./../message');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const urlPath = '/admin/';
const urls = [
    'admin',
    'current',
    'history',
    'login',
    'logout',
    'myInfo',
    'notice',
    'summary',
    'visit',
];

//middle-ware
router.use(
    session({
        store: new FileStore(),
        secret: 'c55fv0IicgLyu4eq',
        resave: true,
        rolling: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60, // 섹션 유효시간
        },
    })
);

router.use('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin); //req.headers.origin
    res.header('Access-Control-Allow-Credentials', 'true'); //req.headers.origin
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type,Content-Length, Authorization,Origin,Accept,X-Requested-With'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );

    if (urls.includes(req.baseUrl.replace(urlPath, ''))) {
        //세션 유지
        if (req.session.uid) {
            req.session.uid = req.session.uid;
            req.session.uname = req.session.uname;
            req.session.uauthor = req.session.uauthor;
        }
        return next();
    }
    /*
  if(!req.headers.token){
      return res.status(401).send(msg.TOKEN_REQUIRED);
  }else{
      let result = tokenDecode(req.headers.token);
      if(result == "INVALID"){
          return res.status(401).send(msg.TOKEN_INVALID);
      }
  }
  */
    return next();
});

module.exports = router;
