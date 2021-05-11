const express = require('express');
const app = express();
const dotEnv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// configure cors
app.use(cors());

// configure express for form data
app.use(express.json());

// configure dotEnv
dotEnv.config({path : './env/.env'});

const port = process.env.PORT || 5000;

// configure mongodb
mongoose.connect(process.env.MONGO_DB_LOCAL_URL, {
    useUnifiedTopology : true,
    useNewUrlParser : true,
    useFindAndModify : false,
    useCreateIndex : true
}).then((response) => {
    console.log('Connected to Mongodb successfully.....');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});

app.get('/', (request , response) => {
    response.send(`<h2>Welcome to Angular Social App Backend</h2>`);
});

// router configuration
app.use('/api/users' , require('./router/userRouter'));
app.use('/api/profiles' , require('./router/profileRouter'));
app.use('/api/posts' , require('./router/postRouter'));

app.listen(port, () => {
    console.log(`Express Server is started at : ${port}`);
});