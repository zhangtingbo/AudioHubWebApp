const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
let MongoClient = require('mongodb').MongoClient;

app.use(cors())
// serve up production assets
// app.use(express.static('./public'));
// let the react app to handle any unknown routes 
// serve up the index.html if express does'nt recognize the route
// const path = require('path');
// app.get('*', (req, res) => {
// res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
// });

let mongoUrlLocal = "htxassignment-mongodb-1://admin:password@0.0.0.0:27017/";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@localhost:27017/audio-db?authSource=admin&readPreference=primary&ssl=false&directConnection=true";
let mydb = 'audio-db';
let mongoURI = mongoUrlDocker + mydb;
//mongodb://admin:password@localhost:27017/audio-db?authSource=admin&readPreference=primary&ssl=false&directConnection=true

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true};

async function connectDB(toDoProc){
    try{
        let db = await mongoose.connect(mongoUrlDocker,mongoClientOptions);
        // console.log("Connected db: ",db)
        toDoProc(db);
        
    }
    catch(err){
        console.log(err)
    }
}

// connectDB((db)=>{
//     console.log("insert user here:");

//     const userSchema = new mongoose.Schema({
//         name: { type: String, required: true },
//         email: { type: String },
//         password: { type: String, required: true },
//     });

//     const User = mongoose.model('User', userSchema);

//     const newUser = new User({
//     name: 'test2',
//     email: 'test2@example.com',
//     password: 'password'
//     });

//     newUser.save()
//     .then(() => console.log('User saved to database'))
//     .catch(err => console.log(err));

//     setTimeout(()=>{
//         db.disconnect();
//         console.log("Disconnect DB")
//     },2000)
// })

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";

app.use(express.json())

app.get('/', (req, res) => {
    res.send("my app")
});

app.post('/api/addNewUser', (req, res) => {

    let userObj = req.body;

    connectDB((db)=>{
        console.log("insert user here:", userObj);

        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String },
            password: { type: String, required: true },
        });
    
        const User = mongoose.model('User', userSchema);
    
        const newUser = new User({
            name: userObj.username,
            email:  userObj.email,
            password: userObj.password
        });
    
        newUser.save()
        .then(() => console.log('User saved to database'))
        .catch(err => console.log(err));
    
        setTimeout(()=>{
            db.disconnect();
            console.log("Disconnect DB")
        },2000)
    })

    userObj.added = true;
    res.json(userObj)
})

console.log('Received username:');

// if not in production use the port 5000
const PORT = process.env.PORT || 5000;
console.log('server started on port:', PORT);
app.listen(PORT);