const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const { 
  HOST, PORT, STATIC_docView, STATIC_docEditor, SESSIONS_DIR, 
  SESSION_CONFIG, STATIC_DIR
} = require('./server.config')
const { 
  getNextSessionIndex, getDirectorySize, getDirectoryFiles,
  removeFile, getFoldersWithSessionConfig, zipFolder,
} = require('./utils');

// Uncomment to use Microsoft Windows SSPI
// const { sso } = require('node-expose-sspi');


// =========================================================
// SERVER

const app = express();

// Uncomment to use Microsoft Windows SSPI
// const { sso } = require('node-expose-sspi');
// app.use(sso.auth());

// Define CORS options of UI dev
// COMMENT IN PRODUCTION
const corsOptions = {
  origin: 'http://localhost:8082', 
  methods: 'GET,POST,DELETE',   
  allowedHeaders: 'Content-Type',
};
// Use the cors middleware with options
app.use(cors(corsOptions));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse JSON bodies
app.use(bodyParser.json({ limit: '50mb' })); 

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// =======================================================================

// Middleware to serve static files
app.use('/', express.static(STATIC_DIR))
app.use('/sessions', express.static(SESSIONS_DIR));
app.use('/static/editor', express.static(STATIC_docEditor));

// Route to main page
app.get('/', (req, res) => {
	// Get the protocol from the request headers or use the default protocol
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  // Get the host from the request headers
  const host = req.headers.host;
  // Construct the requestUrl dynamically
  const requestUrl = `${protocol}://${host}`;

  res.render('index', { requestUrl: requestUrl });
});

// Route to serve editor app
app.get('/editor', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).send('sessionID query parameter is required');
  }
  // Get the protocol from the request headers or use the default protocol
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  // Get the host from the request headers
  const host = req.headers.host;
  // Construct the requestUrl dynamically
  const requestUrl = `${protocol}://${host}`;

  res.render('editor', { requestUrl: requestUrl });
});

// Route to create a new session
app.get('/createNewSession', async (req, res) => {
  try {
    const nextIndex = await getNextSessionIndex(SESSIONS_DIR);
    const sessionID = `${nextIndex}_${uuidv4()}`;
    const sourceDir = STATIC_docView;
    const targetDir = path.join(SESSIONS_DIR, sessionID);

    // Copy the source directory to the new session directory
    await fs.copy(sourceDir, targetDir);

    // Write the session.config file
    const configPath = path.join(targetDir, 'session.config');
    const authUser = null;
	  // const authUser = req.headers['x-iisnode-auth_user'] || null
	  //const authUser = req.sso ? req.sso.user.name : null
    await fs.writeJson(configPath, {...SESSION_CONFIG, owner:authUser}, { spaces: 2 });
    console.log(`Session ${sessionID} created`)
    res.status(200).json({
      message: `Session created with ID: ${sessionID}`,
      id: sessionID,
    });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ message: 'Error creating session' });
  }
});

app.get('/getAllSessions', (req, res) => {
  const sessions = getFoldersWithSessionConfig(SESSIONS_DIR);
  res.status(200).json(sessions);
});

// Route to redirect to the document for a specific session
app.get('/getSession', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).send('sessionID query parameter is required');
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  fs.pathExists(sessionPath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).send(`Session ${sessionID} not exists!`);
    }
    res.redirect(`/sessions/${sessionID}`);
  });
});

// Reoute to remove session
app.delete('/removeSession', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).json({message: 'sessionID query parameter is required'});
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  fs.pathExists(sessionPath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).json({message: `Session ${sessionID} not exists!`});
    }
    fs.removeSync(sessionPath);
    console.log(`Session ${sessionID} removed`)
    return res.status(200).json({message: `Session ${sessionID} removed!`});
  });
});

// Route to download the document for a specific session
app.get('/downloadSessionDoc', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).json({
      message: 'sessionID query parameter is required',
    });
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  fs.pathExists(sessionPath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).json({
        message: `Session ${sessionID} not exists!`
      });
    }
    // Prepare headers
    res.setHeader('Content-Disposition', `attachment; filename=${sessionID}.lumiDoc`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Pack session to archive
    const archiveStream = zipFolder({
      folderPath: sessionPath,
      except: ['session.config']
    });
    archiveStream.pipe(res);
    archiveStream.on('end', () => {
      console.log(`Session ${sessionID}: Archive stream finalized and sent.`);
    });
    archiveStream.on('error', (err) => {
      res.status(500).json({ message: 'Error creating the zip archive', error: err });
    });
  });
});

// Route to config for specific session
app.get('/getSessionConfig', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).send('sessionID query parameter is required');
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  fs.pathExists(sessionPath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).send(`Session ${sessionID} does not exist!`);
    }
    const configPath = path.join(sessionPath, 'session.config');
    fs.readJson(configPath, (err, sessionConfig) => {
      if (err) {
        console.error('Error reading session.config:', err);
        return res.status(500).send(`Error reading configuration of session ${sessionID}`);
      }
      res.status(200).json(sessionConfig);
    });
  });
});

// Route to get specific session free space
app.get('/getSessionFreeSpace', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).send('sessionID query parameter is required');
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  fs.pathExists(sessionPath, async (err, exists) => {
    if (err || !exists) {
      return res.status(404).send(`Session ${sessionID} does not exist!`);
    }
    const configPath = path.join(sessionPath, 'session.config');
    fs.readJson(configPath, async (err, sessionConfig) => {
      if (err) {
        console.error('Error reading session.config:', err);
        return res.status(500).send(`Error reading configuration of session ${sessionID}`);
      }
      try {
        const totalSessionSize = await getDirectorySize(sessionPath);
        const freeSpace = sessionConfig.totalSizeLimit - totalSessionSize;
        res.status(200).json({ space: freeSpace });
      } catch (err) {
        console.error('Error calculating directory size:', err);
        res.status(500).send(`Error calculating free space for session ${sessionID}`);
      }
    });
  });
});

// Route to get specific session resource files
app.get('/getResources', (req, res) => {
  const sessionID = req.query.sessionID;
  if (!sessionID) {
    return res.status(400).send('sessionID query parameter is required');
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  fs.pathExists(sessionPath, async (err, exists) => {
    if (err || !exists) {
      return res.status(404).send(`Session ${sessionID} does not exist!`);
    }
    const resourcesPath = path.join(sessionPath, 'resources');
    const resources = await getDirectoryFiles(resourcesPath)
    res.status(200).send({resources: resources})
  });
});

// Route to upload the document resource
app.post('/uploadResource', upload.single('doc-editor-upload-file'), (req, res) => {
  // Get sessionId, filename and base64 file data
  const { sessionID, filename, file } = req.body;

  if (!sessionID || !file || !filename) {
    return res.status(400).send({ 
      message: 'Body args: sessionID, filename and file are required!', 
    });
  }
  const resourceDir = path.join(SESSIONS_DIR, sessionID, 'resources');
  const resourcePath = path.join(resourceDir, filename);

  // Ensure the directory exists
  fs.ensureDir(resourceDir, err => {
    if (err) {
      console.error('Error ensuring directory exists:', err);
      return res.status(500).send({ 
        message: `Session ${sessionID} not exists!`, 
      });
    }

    // Decode the base64 file data
    const buffer = Buffer.from(file, 'base64');

    // Save the file
    fs.writeFile(resourcePath, buffer, err => {
      if (err) {
        console.error('Error saving image:', err);
        return res.status(500).send({
          message: `Could not save the file ${filename}!`, 
        });
      }
      console.log(`File ${filename} saved in session ${sessionID}`)
      res.status(200).send({
        message: `File ${filename} uploaded!`, 
      });
    });
  });
});

app.get('/uploadResource', (req, res) => {
  return res.status(200).send()
});

// Route to remove a specific file from session resources
app.delete('/removeResource', async (req, res) => {
  const { sessionID, filename } = req.body;
  if (!sessionID || !filename) {
    return res.status(400).send({
      message: 'Body args: sessionID and filename are required!', 
    });
  }
  const sessionPath = path.join(SESSIONS_DIR, sessionID);
  try {
    const exists = await fs.pathExists(sessionPath);
    if (!exists) {
      return res.status(404).send({
        message: `Session ${sessionID} does not exist!`
    });
    }
    const resourcesPath = path.join(sessionPath, 'resources');
    await removeFile(resourcesPath, filename);
    console.log(`File ${filename} removed from session ${sessionID}`)
    res.status(200).send({
        message: `File ${filename} removed successfully`
    })
  } catch (err) {
    res.status(500).send({
        message: `Error removing file: ${err.message}`
    });
  }
});

// Route to upload the document config 
app.post('/uploadDocConfig', (req, res) => {
  // Get sessionId, filename and base64 file data
  const { sessionID, config } = req.body;

  if (!sessionID || !config) {
    return res.status(400).send({ 
      message: 'Body args: sessionID and config are required!', 
    });
  }
  const sessionDir = path.join(SESSIONS_DIR, sessionID);
  // Ensure the directory exists
  fs.ensureDir(sessionDir, err => {
    if (err) {
      console.error('Error ensuring directory exists:', err);
      return res.status(500).send({ 
        message: `Session ${sessionID} not exists!`, 
      });
    }

    // Save the file
    const fname = path.join(sessionDir, 'config.json');
    fs.writeFile(fname, JSON.stringify(config, null, 2), err => {
      if (err) {
        console.error('Error saving config file:', err);
        return res.status(500).send({
          message: `Could not save config.json file!`, 
        });
      }
      console.log(`File config.json saved in session ${sessionID}`);
      res.status(200).send({
        message: `Document saved in session!`, 
      });
    });
  });
});

app.listen(PORT, HOST, () => {
  console.log(`lumi-doc: server running on port :${PORT}`);
});
