# bo-api-starter

:smiley: 블록오디세이에 맞춘 Express Api Starter입니다. :smiley:  
:bangbang: [프로젝트 설치 방법](https://github.com/BlockOdyssey/bo-api-starter#project-installation "project-installation") & [사용 설명서](https://github.com/BlockOdyssey/bo-api-starter#usage-and-getting-started "usage") :bangbang:

## Project Features

-   **Server** : [Express](https://expressjs.com/ "expressjs")
-   **Database** : [MySQL](https://github.com/mysqljs/mysql#readme "mysql")
-   **Session** : [express-session](https://github.com/expressjs/session#readme "express-session"), [session-file-store](https://github.com/valery-barysok/session-file-store "session-file-store")
-   **URL + Responses** : [node-fetch](https://github.com/node-fetch/node-fetch "node-fetch")
-   **HTTP Status** : [http-status-codes](https://github.com/prettymuchbryce/http-status-codes#readme "http-status-codes")
-   **AWS SDK** : [aws-sdk](https://github.com/aws/aws-sdk-js "aws-sdk")
-   **Environment Variables** : [dotenv](https://github.com/motdotla/dotenv#readme "dotenv")
-   **Only Development** : [nodemon](https://nodemon.io/ "nodemon")

## Project Installation

<pre><code> $ npx bo-api-starter projectname </code></pre>

:fire: `npm i bo-api-starter` 명령어를 사용하면 프로젝트가 정상적으로 설치되지 않습니다. :fire:

## Usage and Getting Started

### Install Dependencies

 <pre><code> $ cd projectname

 $ npm install 
</code></pre>

### Project Environment Setup

#### 1. .env.example 파일을 복사하여 .env 파일을 생성

 <pre><code>// example을 실제 값으로 변경 
 MYSQL_USER=example   
 MYSQL_DATABASE=example
 S3_BUCKET=example
 S3_ACCESSKEYID=EXAMPLE</code></pre>

#### 2. config.js 파일에서 .env 파일의 경로를 수정

<pre><code>require("dotenv").config({
    path: (function () {
        // return `../.env`; 서버 경로
        return `./.env`; // 로컬 경로
    })()
});
</code></pre>

#### 3. /bin/www 파일에서

-   상용일 경우 PORT를 3000, 3001로 변경
-   개발일 경우 PORT를 4000, 4001로 변경

#### 4. nodemon 사용할 경우

-   package.json에서 수정

<pre><code>"scripts": {
    "start": "nodemon ./bin/www"
}</code></pre>

### Project Run

 <pre><code>$ npm start </code></pre>

## HTTP STATUS CODES 사용 가이드라인

### HTTP STATUS: 200

> 데이터 조회, 수정, 삭제 성공 (GET, PUT, DELETE 성공)

```javascript
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.OK).send(data);
```

### HTTP STATUS: 201

> 새로운 데이터 생성 성공 (POST 성공)

```javascript
// SAMPLE CODE
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.CREATED).json({ result: "SUCCESS", message: "데이터를 입력하였습니다." });
```

### HTTP STATUS: 401

> 인증이 필요한 경우 (TOKEN REQUIRED / TOKEN EXPIRED)

```javascript
// SAMPLE CODE
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.UNAUTHORIZED).json({ result: "FAIL", message: "유효한 토큰이 아닙니다." });
```

### HTTP STATUS: 403

> 인증되었지만 권한이 없을 때

```javascript
// SAMPLE CODE
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.FORBIDDEN).json({ result: "FAIL", message: "권한이 없습니다." });
```

### HTTP STATUS: 409

> DATABASE에 데이터가 삽입/수정/삭제 또는 조회할 수 없을 경우

```javascript
// SAMPLE CODE
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.CONFLICT).json({ result: "FAIL", message: "정상적으로 처리되지 않았습니다." });
```

### HTTP STATUS: 422

> 올바른 입력값이 아닌 경우 (Invalid User Input)

```javascript
// SAMPLE CODE
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ result: "EMPTY", message: "비밀번호를 입력해주세요." });
```

### HTTP STATUS: 500

> 내부 서버 에러

```javascript
// SAMPLE CODE
import { StatusCodes } from "http-status-codes";

response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ result: "ERROR", message: "일시적으로 에러가 발생하였습니다. 잠시 후에 다시 시도해주세요." });
```

## Project Flow

| 순서 | 파일 / 폴더 |                   기능                    |
| :--: | :---------: | :---------------------------------------: |
|  1   |   app.js    | session 설정, middleware 추가, route 추가 |
|  2   | middleware  |         APP & WEB middleware 설정         |
|  3   |   routes    | APP & WEB router(request, response) 작성  |
|  4   |   service   |            Business Logic 작성            |
|  5   |    query    |              SQL Query 작성               |

## Project Structure

```
.
├── README.MD
├── app.js
├── bin                     # 실행파일
│   └── www
├── certkey                 # SSL 인증서
│   ├── cert.crt
│   └── key.key
├── config.js               # MySQL, AWS, 환경변수 설정
├── middleware              # MIDDLEWARE 설정
│   ├── app                 # APP
│   │   └── mw.js
│   └── web                 # WEB
│       └── mw.js
├── package.json
├── public
│   └── stylesheets
│       └── style.css
├── query                   # SQL Query
│   └── users.js
├── routes
│   ├── app                 # APP
│   │   ├── index.js
│   │   └── users.js
│   └── web                 # WEB
│       ├── index.js
│       └── users.js
└── service                 # Business Logic
    ├── index.js
    └── users
        └── findUser.js
```
