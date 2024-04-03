require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const predictionsRoute = require('./routes/predictionsRoute');
const mongoose = require('mongoose');
const dietTypesRoute = require('./routes/dietTypeRoute');
const app = express();


mongoose.connect(`${process.env.MONGO_URL}`)
  .then(() => console.log("MongoDb database Connected ..."))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());
app.use('/predictions', predictionsRoute);
app.use('/dietType', dietTypesRoute);

const httpServer = require('http').createServer(app);


const port = process.env.PORT;


httpServer.listen(port, () => console.log(`Up & Running on port ${port}`));