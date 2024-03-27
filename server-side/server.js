require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const predictionsRoute = require('./routes/predictionsRoute');
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use('/predictions', predictionsRoute);

const httpServer = require('http').createServer(app);


const port = process.env.PORT;


httpServer.listen(port, () => console.log(`Up & Running on port ${port}`));