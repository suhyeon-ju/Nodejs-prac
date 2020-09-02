var fs = require('fs');

//파일에 데이터를 씁니다.
// open('파일명',flag,callback)
// flag
// r: 읽기, w: 쓰기, w+: 읽기 쓰기 , a+: 읽기와 추가
fs.open('./output.txt','a+',function(err, fd){
    if(err) throw err;
    
    var buf = new Buffer('나야!\n');
    fs.write(fd, buf, 0 , buf.length,null,function(err, written, buffer){
        if(err) throw err;
        
        console.log(err, written,buffer);
        
        fs.close(fd, function(){
            console.log('파일 열고 데이터 쓰고 파일 닫기 완료.');
        });
    });
});