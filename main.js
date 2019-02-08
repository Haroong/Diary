// WEB2 - Node.js
// 웹서버 만들기

// module 사용
var http = require('http');
var fs = require('fs'); // using filesystem module
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html'); // sanitize-html: 출력 정보 보안

var app = http.createServer(function(request, response){
    // parameter request: 요청할 때 웹 브라우저가 보낸 정보
    // parameter response: 응답할 때 우리가 웹 브라우저에게 보낼 정보
    var _url = request.url;
    var queryData = url.parse(_url, true).query; // url 정보 분석
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
        if(queryData.id === undefined){
            // 본문 홈페이지에 대한 구현
            // data 디렉토리에서 파일을 읽음
            fs.readdir('./data', function(error, filelist){
                var title = 'Welcome!';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200); // 200의 의미: 파일을 성공적으로 전송
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist){
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description){
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description);
                    var list = template.list(filelist);
                    var html = template.HTML(sanitizedTitle, list,
                         `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                         `<a href="/create">create</a>
                          <a href="/update?id=${sanitizedTitle}">update</a>
                          <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                          </form>`
                     );
                response.writeHead(200); // 200의 의미: 파일을 성공적으로 전송
                response.end(html);
                });
            });
        }
    } else if(pathname === '/create') { // 글 생성: post 방식으로 전송
        fs.readdir('./data', function(error, filelist){
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
                <form action="create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `);
            response.writeHead(200); // 200의 의미: 파일을 성공적으로 전송
            response.end(html);
        })
    } else if (pathname === '/create_process'){
        var body = '';

        // callback이 실행될 때마다 body에 data 추가
        request.on('data', function(data){
            body += data;
        });
        // end: 정보 수신이 끝남
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            // 파일이 생성되면 data 폴더에 자동으로 생성
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?=id${title}`});
                response.end('success');
            })
        });
    } else if (pathname === '/update'){
        fs.readdir('./data', function(error, filelist){
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function (err, description){
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                     `
                     <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                     </form>
                     `,
                     `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                 );
            response.writeHead(200); // 200의 의미: 파일을 성공적으로 전송
            response.end(html);
            });
        });
    } else if (pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            // 글 제목 수정
            fs.rename(`data/${id}`, `data/${title}`, function(error){
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location: `/?=id${title}`});
                    response.end('success');
                })
            });

            console.log(post);
            /*
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?=id${title}`});
                response.end('success');
            })
            */
        });
    } else if (pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(queryData.id).base;
            fs.unlink(`data/${filteredId}`, function(error){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    } else {
        // 잘못된 주소로 접근할 경우 error 표시. 404 not found
        response.writeHead(404); // 404의 의미: 파일을 찾을 수 없음
        response.end('Not Found');
    }
});
app.listen(3000);
