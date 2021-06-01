var express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");



var app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));



app.get("/url", (req, res, next) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
   });

app.post("/slackbot-data", (req, res, next) => {
    const handle = require("./index");
    // console.log("req: ", JSON.parse(req.body.payload).actions[0].selected_date);
    console.log("req: ", JSON.parse(req.body.payload));
    res.json(req.body.payload);
    let user = JSON.parse(req.body.payload).user.id;
    handle.handleMessages(user, 'hi');
});

app.listen(3001, () => {
 console.log("Server running on port 3001");
});

