
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;
require('./db')

const allowedOrigins = [process.env.FRONTEND_URL];

app.use(
    cors({
        origin:function(origin,callback) {
            if(!origin || allowedOrigins.includes(origin)){
                callback(null,true);
            }
            else{
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials : true
    })
)

app.use(bodyparser.json());
app.use(cookieParser({
    httpOnly : true,
    secure:true,
    sameSite:'none',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    signed:true
}));

const authRoutes = require('./routes/authRoutes')
const classroomRoutes = require('./routes/classroomRoutes')


app.use('/auth',authRoutes)
app.use('/class',classroomRoutes)

app.use("/files", express.static(path.join(__dirname, "./uploads")));



app.get('/',(req,res) => {
    res.send('Hello World!')
})

app.get('/getuserdata',(req,res)=>{
    res.send('abhishek, 20,Male')
})

app.listen(port, () =>{
    console.log(`NIT-FORUM_BACKEND is listening on port: ${port}`)
})