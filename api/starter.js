const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

var app = express();
dotenv.config();

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

app.post("/slackbot-data", async (req, res, next) => {
    const handle = require("../index");
    console.log(require.cache[require.resolve('../index')]);
    let user = JSON.parse(req.body.payload).user.id;
    let message = JSON.parse(req.body.payload).actions[0].selected_date;
    console.log("message: " + message);
    handle.getDataFromApi(user, 'hi');
    // delete require.cache[require.resolve('../index')];
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

