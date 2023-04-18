const express = require('express');
// const trackRoute = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const {MongoClient,GridFSBucket} = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const Grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
/**
 * Create Express server && Express Router configuration.
 */
const app = express();
// app.use('/uploadaudio', trackRoute);
// Middleware
app.use(cors({origin: true, credentials: true}))
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.json())


// serve up production assets
// app.use(express.static('./public'));
// let the react app to handle any unknown routes 
// serve up the index.html if express does'nt recognize the route
// const path = require('path');
// app.get('*', (req, res) => {
// res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
// });

/**
 * Connect Mongo Driver to MongoDB.
 */
// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@localhost:27017/audio-db?authSource=admin&readPreference=primary&ssl=false&directConnection=true";
// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true};
// Create mongo connection
const conn = mongoose.createConnection(mongoUrlDocker,mongoClientOptions);

// Init gfs
let gfs;
conn.once('open', () => {
  // Init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {bucketName:'audios'});

});

// Create storage engine
const storage = new GridFsStorage({
    url: mongoUrlDocker,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'audios'
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });

// @route POST /upload
// @desc  Uploads file to DB
app.post('/uploadaudio', upload.single('file'), (req, res) => {
    // res.json({ file: req.file });
    res.redirect('/');
  });


app.get('/', (req, res) => {
    res.send("my app")
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/audiofiles', (req, res) => {
    
  const id = new mongoose.Types.ObjectId("643e8079461efa3a3b4e9b31");
  const filename = id;
    gfs.openDownloadStream(id).
      pipe(fs.createWriteStream('./downloads/'+filename+'.wav'))

    return res.json({});
});

app.post('/api/addNewUser', (req, res) => {

    let userObj = req.body;

    console.log("insert user here:", userObj);
    // if(mongoose.connection.db){
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
    
        // setTimeout(()=>{
        //     db.disconnect();
        //     console.log("Disconnect DB")
        // },2000)
    // }

    userObj.added = true;
    res.json(userObj)
});

/**
 * POST /tracks
 */
app.post('/uploadaudioxx', (req, res) => {
    
    const storage = multer.memoryStorage()
    const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }});
    upload.single('track')(req, res, (err) => {
        console.log("trackRoute:",req.file)
        console.log("trackName :",req.body )
        console.log("any error: ",err)
      if (err) {
        return res.status(400).json({ message: "Upload Request Validation Failed" });
      } else if(!req.file.originalname) {
        return res.status(400).json({ message: "No track name in request body" });
      }

      let trackName = req.file.originalname;

      
      
      // Covert buffer to Readable Stream
      const readableTrackStream = new Readable();
      readableTrackStream.push(req.file.buffer);
      readableTrackStream.push(null);
  
      let bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'tracks'
      });
  
      
      let uploadStream = bucket.openUploadStream("myAudio");
      let id = uploadStream.id;
      readableTrackStream.pipe(uploadStream);
  
      uploadStream.on('error', (err) => {
        console.log("uploadStream error:",err)
        return res.status(500).json({ message: "Error uploading file" });
      });
  
      uploadStream.on('finish', () => {
        console.log("uploadStream finish: id:",id)
        return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
      });

        // return res.status(201).json(req.body)
    });
  });

// if not in production use the port 5000
const PORT = process.env.PORT || 5000;
console.log('server started on port:', PORT);
app.listen(PORT);