require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const predictionsRoute = require('./routes/predictionsRoute');
const passport = require('passport');
const mongoose = require('mongoose');
const dietTypesRoute = require('./routes/dietTypeRoute');
const mealPlanRoutes = require('./routes/mealPlanRoute');
const userRouter = require('./routes/userRoute');
const dietAssessmentRoute = require('./routes/dietAssessmentRoute');
const app = express();


mongoose.connect(`${process.env.MONGO_URL}`)
  .then(() => console.log("MongoDb database Connected ..."))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
require('./config/passport')(passport);
app.use('/predictions', predictionsRoute);
app.use('/dietType', dietTypesRoute);
app.use('/mealPlan', mealPlanRoutes);
app.use('/user', userRouter);
app.use('/diet-assessment', dietAssessmentRoute);

const httpServer = require('http').createServer(app);


const port = process.env.PORT;


httpServer.listen(port, () => console.log(`Up & Running on port ${port}`));