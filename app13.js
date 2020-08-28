//Express 기본 모듈 불러오기
var express = require('express')
, http = require('http')
, path = require('path');

//Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
    ,cookieParser = require('cookie-parser')
    ,static = require('serve-static')
    ,errorHandler = require('errorhandler');

//오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

//Session 미들웨어 불러오기
var expressSession = require('express-session');

//****************파일 업로드용 미들웨어***************************************************************
var multer = require('multer');
var fs = require('fs');

//클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속)지원
var cors = require('cors');

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
app.use('/uploads', static(path.join(__dirname, 'uploads')));

//미들웨어로 등록, cookie-parser 설정
app.use(cookieParser());
//세션 설정
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

app.use(cors());

//multer 미들웨어 사용: 미들웨어 사용 순서 중요 body-parser -> multer -> router
//파일 제한 : 10개 , 1G           -> uploads폴더로 저장위치 설정
//파일 이름 : 중복 방지를 위해 날짜 붙여서 설정
var storage = multer.diskStorage({
   destination: function (req, file, callback){
       callback(null, 'uploads')
   },
    filename: function (req, file, callback){
        callback(null, file.originalname + Date.now())
    }
});

var upload = multer({
   storage: storage,
    limits: {
        files: 10,
        fileSize: 1024* 1024* 1024
    }
});

//라우터 사용하여 라우팅 함수 등록
var router = express.Router();

router.route('/process/photo').post(upload.array('photo', 1), function(req, res){
   console.log('/process/photo 호출됨.');
    
    try{
        var files = req.files;
        
        console.dir('#===== 업로드된 첫번째 파일 정보 =====#')
        console.dir(req.files[0]);
        console.dir('#=====#')
        
        //현재의 파일 정보를 저장할 변수 선언
        var originalname = '',
            filename = '',
            mimetype = '',
            size = 0;
            //인자가 배열인지 확인(설정에서 1개의 파일도 배열에 넣게 했음)
            if(Array.isArray(files)){ 
                console.log("배열에 들어있는 파일 갯수 : %d", files.length);
                
                for(var index = 0; index < files.length; index++){
                    originalname = files[index].originalname;
                    filename = files[index].filename;
                    mimetype = files[index].mimtype;
                    size = files[index].size;
                }
                
            }else{// 배열에 들어가 있지 않은 경우(현재 설정에서는 해당 없음)
                console.log("파일 갯수: 1");
                
                originalname = files[index].originalname;
                filename = files[index].filename;
                mimetype = files[index].mimtype;
                size = files[index].size;  
            }
        
            console.log('현재 파일 정보 :'+originalname+','+filename+','+mimetype+','+size);
        
            //클라이언트에 응답 전송
         res.writeHead('200',{'Content-Type':'text/html; charset=utf8'});
         res.write('<h1>파일 업로드 성공</h1>');
         res.write('<hr/>');
         res.write('<p>원본 파일 이름 : '+originalname+' -> 저장 파일명: '+filename+'</p>');
         res.write('<p>MIME TYPE : '+mimetype+'</p>');
         res.write('<p>파일 크기 : '+size+'</p>');
         res.end();  
    }catch(err){
        console.dir(err.stack);
    }
});


//*******************************************************************************

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