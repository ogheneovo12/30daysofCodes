var http = require("http")
var fs = require("fs")

var server = http.createServer((req,res)=>{
    if (req.method == "POST"){
        let body = "";
        req.on('data',chunk=>{
            body +=chunk.toString();
        })
        req.on("end",()=>{
            console.log(body)
            fs.writeFileSync('message.text',body)
            res.end("ok")
        })
    }else{
        res.end(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="./feday2.css">
            <title>30daysOfCoding-signInPage</title>
        </head>
        <body>
        <form method="POST" action="/message" class="form-control">
        <div class="form-group">
            <label>username</label>
            <input type="textbox" name="username">
        </div>
        <div class="form-group">
            <label>password</label>
            <input type="password" name="password">
        </div>
        <div class="form-group submit"  >
            <span><a href="#" >can't login?</a></span>
            <label></label>
            <input type="submit" value="login">
        </div>
       
    </form>
    </body>
        `)
    }
})
server.listen(8000)