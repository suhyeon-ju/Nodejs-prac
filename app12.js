var express = require('express')
, http = require('http')
, path = require('path');

//Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
    ,static = require('serve-static');

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

//익스프레스 객체 생성
var app = express();
//기본 속성 설정 -> process.env의 기본 포트가 있으면 사용하거나 3000 사용
app.set('port', process.env.PORT || 3000);

//body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false}));
//body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());
//public 폴더 안에 있는 것 사용
app.use('/public', static(path.join(__dirname, 'public')));
//미들웨어로 등록
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

var router = express.Router();

router.route('/process/product').get(function(req, res){
   console.log('/process/product 라우팅 함수 호출됨.');
    
    if(req.session.user){
        res.redirect('/public/product.html');
    }else{
        res.redirect('/public/login2.html');
    }
});

//
router.route('/process/login').post(function(req, res){
   console.log('/process/login 라우팅 함수 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('요청 파라미터 : '+ paramId +','+ paramPassword);
    
    if(req.session.user){
        console.log('이미 로그인되어 있습니다.');
        
        res.redirect('/public/product.html');
    }else{
        req.session.user ={
            id:paramId,
            name:'소녀시대',
            authorized:true
        };
        
        res.writeHead(200,{"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>로그인 성공</h1>');
        res.write('<p>Id: '+paramId+'</p>');
        res.write('<br><br><a href="/public/product.html">상품 페이지로 이동하기</a>');
        res.end();
    }
});

router.route('/process/logout').get(function(req, res){
   console.log('/process/logout 라우팅 함수 호출됨.');
    
    if(req.session.user){
        console.log('로그아웃합니다.');
        
        req.session.destroy(function(err){
            if(err){
                console.log('세션 삭제 시 에러 발생.');
                return;
            }
            console.log('세션 삭제 성공.');
            res.redirect('/public/login2.html');
        });
    }else{
            console.log('로그인되어 있지 않습니다.');
            res.redirect('/public/login2.html');
    }
});



router.route('/process/setUserCookie').get(function(req,res){
    console.log('/process/setUserCookie 라우팅 함수 호출됨.');
    
    res.cookie('user', {
        id:'mike',
        name: '소녀시대',
        authorized: true
    });
    res.redirect('/process/showCookie');
});

router.route('/process/showCookie').get(function(req,res){
    console.log('/process/showCookie 라우팅 함수 호출됨.');
    
    res.send(req.cookies);
});





// /process/login이 루트로 들어온 것만 처리
router.route('/process/login').post(function(req, res){
    console.log('/process/login 처리함.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    
     res.writeHead('200',{'Content-Type':'text/html; charset=utf8'});
    res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
    res.write('<div><p>Param id : '+paramId+'</p></div>');
    res.write('<div><p>Param password : '+paramPassword+'</p></div>');
    res.write("<br><br><a href='/public/login2.html'>로그인 페이지로 돌아가기</a>");
    res.end();
    
});


app.use('/', router);

//오류 페이지 보여 주기
app.all('*', function(req,res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});

http.createServer(app).listen(3000, function(){
    console.log('Express 서버가 3000번 포트에서 시작됨.');
});