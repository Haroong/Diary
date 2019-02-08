// refactoring
module.exports = template = {
    HTML:function(title, list, body, control){
        return `
            <!doctype html>
            <html>
            <head>
                <title>Secret Diary</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">Secret Diary</a></h1>
                ${list}
                ${control}
                ${body}
                <div id="content">
                    <form>
                        <ul>
                            <li>feeling: </li>
                            <li>song of the day: </li>
                            <li>today was... <p><input type="textarea" name="writing"></p></li>
                        </ul>
                    </form>
                </div>
              <button type="submit">save</button>
            </body>
            </html>
        `;
    }, list:function(filelist){
        // 파일 목록 출력
        var list = '<ul>';
        var i = 0;
        while(i < filelist.length){
            list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i += 1;
        }
        list += '</ul>';
        return list;
    }
}
