const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
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

// Middleware
app.use(cors({origin: true, credentials: true}))
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'downloads'))); // for audio download
app.use(express.static(path.join(__dirname, 'public')));

// if not in production use the port 5010
const PORT = process.env.PORT || 5010;
const hostUrl = "http://localhost:"+PORT;
console.log('server started on port:', PORT);
app.listen(PORT);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

/**
 * Connect Mongo Driver to MongoDB.
 */
// use when starting application as docker container
let mongoUrlLocal = "mongodb://admin:password@0.0.0.0:27017/audio-db?authSource=admin&readPreference=primary&ssl=false&directConnection=true";
let mongoUrlDocker = "mongodb://admin:password@mongodb:27017/audio-db?authSource=admin&readPreference=primary&ssl=false&directConnection=true";
// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine

// Create mongo connection
let gfs;
// Init gfs
const User = mongoose.model('users', new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
}));
const createDefaultUser = async ()=>{
  const user = await User.findOne({ username: 'administrator' }).exec();
  if(!user){
    console.log("default administrator is not exist, create it first")
    bcrypt.genSalt().then(salt=>{
      bcrypt.hash('1Password', salt)
      .then(hashedPassword=>{
        const defaultUser = new User({ username: 'administrator', password: hashedPassword});
        defaultUser.save()
          .then(() => { console.log('Default user created'); })
          .catch(err => console.error('Error creating default user', err));
      })
    })
  }
}

const conn = mongoose.createConnection(mongoUrlLocal);
conn.once('open', () => {
  // Init stream and defaut user
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {bucketName:'audios'});
  createDefaultUser();
});

mongoose.connect(mongoUrlLocal).then(res=>{
  console.log("Connect DB successed")
}).catch(err=>{
  console.log("Connect DB failed")
});

const storage = new GridFsStorage({
  url: mongoUrlLocal,
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

/**
 * User Login services
 */

// createDefaultUser();

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
  console.log("existingUser:",existingUser)
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
      res.json({ message: 'Invalid username' });
    }
    const isMatch = await bcrypt.compare(tobeCheckedPassword, user.password);
    if (!isMatch) {
      res.json({ message: 'Invalid password' });
    }

    res.json({ message: 'Check password successful'});
  }
  catch(error){
    console.log("Error happened when check password: ",error);
    res.json({ message: 'Error happened when check password '+error });
  }
  
});
/**
 * delete user
 */
app.delete('/api/deleteaccount/:id', async (req, res) => {
    const userId = req.params.id;

    try {
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      res.send(deletedUser);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Server error' });
    }
});



/**
 * Audio upload/download services
 */
// @route POST /upload
// @desc  Uploads file to DB
app.post('/api/audioupload', upload.single('file'), async (req, res) => {

  try{
    if(gfs){
      const files = await gfs.find().toArray();
  
      return res.status(200).json({ message: 'Get all audio files', files });
    }
  }
  catch(e){
    return res.status(500).json({ message: 'Server Error happens' });
  }
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/api/audiolist', async (req, res) => {
    
  const files = await gfs.find().toArray();

    return res.status(200).json({ message: 'Get audio files', files });
  
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

    const downloadStream = gfs.openDownloadStream(obj_id);
    // const downloadfilename = req.params.filename;
    console.log("Audio file downloads path:",path.join(__dirname, "downloads/"+filename))
    const rs = fs.createWriteStream(path.join(__dirname, "downloads/"+filename));
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
      const fileUrl = `${hostUrl}/${filename}`;
      res.status(200).json({message:"Download successed!",fileUrl,id})
    });
  }
  catch(e){

  }
});

/**
 * delete Audio file, can be done by user who uploads this audio
 */
app.delete('/api/audiodelete/:id', async (req, res) => {
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

