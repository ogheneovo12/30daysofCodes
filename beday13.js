const http = require("http");
const PORT = process.env.PORT || 3000;
let data = [];

const routes = {
  "/": function root(req, res) {
    res.writeHead("200");
    res.end(`
        <h1>welcome to basic server</h1>
           <h2>Post to [POST] localhost:3000/createdata and get from [GET] localhost:3000/getdata</h2>
    `);
  },
  "/createdata": function createData(req, res) {
    if (req.method != "POST") {
      res.writeHead(404);
      res.end(http.STATUS_CODES[404]);
    }
    req.on("data", (chunk) => {
      data.push(chunk);
      res.end(JSON.stringify({ confirmation: "success" }));
    });
    req.on("end", () => {
      data = JSON.parse(data);
    });
  },
  "/getdata": function getData(req, res) {
    if (req.method != "GET") {
      res.writeHead(404);
      res.end(http.STATUS_CODES[404]);
    }
    res.end(JSON.stringify({ confirmation: "success", data }));
  },
};

const server = http.createServer((req, res) => {
  if (routes[req.url]) {
    return routes[req.url](req, res);
  }
  res.writeHead(404);
  res.end(http.STATUS_CODES[404]);
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
