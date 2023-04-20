const express = require('express');
// const trackRoute = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const {MongoClient,GridFSBucket} = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('./downloads'));
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
mongoose.connect(mongoUrlDocker,mongoClientOptions)

// mongoose.connect(mongoUrlDocker,mongoClientOptions);


/**
 * User Login services
 */
const User = mongoose.model('users', new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
}));

app.use(express.json());

app.get('/api/checkusername/:username',async (req,res)=>{
  const { username } = req.params;

  console.log("check username:",username)
  const user = await User.findOne({ username: username }).exec();
  if (user) {
    console.log(user);
    res.json({ message: 'User already exists',existingUser:true });
  } else {
    console.log('User not found');
    res.json({ message: 'User not found',existingUser:false });
  }
  
});

app.post('/api/signup', async (req, res) => {

  const { username, password } = req.body;
  
  const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const user = new User({ username, password: hashedPassword });
    await user.save();
  
    const token = jwt.sign({ username }, 'secret');
    res.json({ token });
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, username, userid:user._id.toString() });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * updateusername
 */
app.get('/api/updateusername/',async (req,res)=>{
  const newusername = req.query.newusername;
  const oldusername = req.query.oldusername;
  console.log("Get update username request:",oldusername,newusername);

  await User.findOneAndUpdate(
    {username:oldusername}, 
    {username:newusername},
    { new: true }
  ).then(person => {
    console.log("Username update successed")
    const token = jwt.sign({ newusername }, 'secret');
    return res.status(200).json({ message: 'Username update successed!', token });
  })
  .catch(error => {
    console.log("Username update failed")
    return res.status(500).json({ message: 'Username update failed!', error });
  });
});

/**
 * update Password
 */
app.get('/api/updatepassword/',async (req,res)=>{
  const username = req.query.username;
  const password = req.query.password;
  console.log("Get update password request:",username,password);

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.findOneAndUpdate(
    {username:username}, 
    {password:hashedPassword},
    { new: true }
  ).then(person => {
    console.log("Password update successed")
    return res.status(200).json({ message: 'Password update successed!' });
  })
  .catch(error => {
    console.log("Password update failed")
    return res.status(500).json({ message: 'Password update failed!' });
  });
});

/**
  * User logout
*/
app.post('/api/logout', (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * check password
 */
app.get('/api/checkpassword/',async (req,res)=>{
  const tobeCheckedPassword = req.query.password;
  const username = req.query.username;
  console.log("Checking password: ",tobeCheckedPassword,username)

  try{
    //get User from DB by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }
    const isMatch = await bcrypt.compare(tobeCheckedPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({ message: 'Check password successful'});
  }
  catch(error){
    console.log("Error happened when check password: ",error);
    return res.status(500).json({ message: 'Error happened when check password '+error });
  }
  
});
/**
 * delete user
 */
app.delete('/api/deleteaccount/', async (req, res) => {
  try {
    const { userid } = req.query;

    await User.findByIdAndDelete(userid).then(res=>{
      return res.status(200).json({ message: 'Delete Account Successed' });
    }).catch(err=>{
      console.log(err);
      return res.status(500).json({ message: 'Delete Account Failed' });
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Delete Account Failed' });
  }
});



/**
 * Audio upload/download services
 */
// Create storage engine
// Init gfs
let gfs;
const conn = mongoose.createConnection(mongoUrlDocker,mongoClientOptions);
conn.once('open', () => {
  // Init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {bucketName:'audios'});
});

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
            bucketName: 'audios',
            metadata: {
              username: req.body.username,
              userid:req.body.userid,
              category:req.body.category,
              description:req.body.description,
              url:'',
              newFilename:req.body.newFilename
            }
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });

// @route POST /upload
// @desc  Uploads file to DB
app.post('/api/audio', upload.single('file'), async (req, res) => {

  if(gfs){
    const files = await gfs.find().toArray();

    // res.redirect('/');

    return res.status(200).json({ message: 'Get all audio files', files });
  }
    

    // return res.status(200).json({ message: 'Upload Audio File done'});
  });


app.get('/', (req, res) => {
    res.send("my app")
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/api/audio', async (req, res) => {
    
  // const id = new mongoose.Types.ObjectId("643e8079461efa3a3b4e9b31");
  // const filename = id;
  //   gfs.openDownloadStream(id).
  //     pipe(fs.createWriteStream('./downloads/'+filename+'.wav'))

  const files = await gfs.find().toArray();

  if(files && files.length > 0){
    return res.status(200).json({ message: 'Get audio files', files });
  }
  else{
    return res.status(500).json({ message: 'Internal server error',files:[] });
  }
  
});

/**
 * dowload audio file by id
 */
app.get('/api/loadaudio', (req, res) => {
    try{
      const id = req.query.id;
      const filename = req.query.filename;
      const contentType = req.query.contentType;

      console.log("Download start:",id,filename,contentType)
      const obj_id = new mongoose.Types.ObjectId(req.query.id);

      // let ext = '.mp3';
      // switch (req.params.contentType){
      //   case 'audio/wav':
      //     ext = '.wav';
      //     break;
      //   default:
      //     break;
      // }

      const downloadStream = gfs.openDownloadStream(obj_id);
      // const downloadfilename = req.params.filename;
      // console.log(downloadfilename)
      const rs = fs.createWriteStream('./downloads/'+filename);
      // downloadStream.pipe(writestream);

      downloadStream.on('error', () => {
        res.status(404).send('Can not find the file');
      });

      downloadStream.on('data', chunk => {
        rs.write(chunk);
      });

      downloadStream.on('end', () => {
        console.log("Download done::")
        rs.end();
        const fileUrl = `http://localhost:5000/${filename}`;
        res.status(200).json({message:"Download successed!",fileUrl,id})
       
      });
    }
    catch(e){

    }
  

});

/**
 * delete Audio file, can be done by user who uploads this audio
 */
app.delete('/api/audio/:id', async (req, res) => {
  try {
    const obj_id = new mongoose.Types.ObjectId(req.params.id);
    // console.log(obj_id)
    await gfs.delete( obj_id );
    const files = await gfs.find().toArray();
    return res.status(200).json({ message: 'Audio deleted',files:files });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error',files:[] });
  }
});

// if not in production use the port 5000
const PORT = process.env.PORT || 5000;
console.log('server started on port:', PORT);
app.listen(PORT);