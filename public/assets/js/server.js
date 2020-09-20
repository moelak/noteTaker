var express = require('express');
const path = require('path');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
console.log(uuidv4());

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.json());

// Basic route that sends the user first to the AJAX Page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/notes', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/notes.html'));
});

let notes;
async function main() {
  try {
    const rawdata = await readFileAsync(path.join(__dirname + '/db/db.json'), {
      encoding: 'utf8',
    });
    notes = JSON.parse(rawdata);
    console.log('CONTENT:', rawdata);
  } catch (err) {
    console.log('ERROR:', err);
  }
}
main();

console.log(notes);

// Displays all notes
app.get('/api/notes', function (req, res) {
  return res.json(notes);
});
// Displays a single character, or returns false
app.get('/api/notes/:note', function (req, res) {
  var chosen = req.params.note;

  console.log(chosen);

  for (var i = 0; i < notes.length; i++) {
    if (chosen === notes[i].title) {
      return res.json(notes[i]);
    }
  }
  return res.json(false);
});

// Create New Characters - takes in JSON input
app.post('/api/notes', function (req, res) {
  //   var newNotes = req.body;
  const newNotes = {
    title: req.body.title,
    text: req.body.text,
    id: uuidv4(),
  };
  newNotes.title = newNotes.title.replace(/\s+/g, '').toLowerCase();

  console.log(newNotes);

  notes.push(newNotes);

  fs.writeFile(
    path.join(__dirname + '/db/db.json'),
    JSON.stringify(notes),
    err => {
      if (err) throw err;

      console.log('Done writing');
    }
  );

  res.json(newNotes);
});

app.delete('/api/notes/:id', (req, res) => {
  var chosen1 = req.params.id;
  console.log(chosen1);
  console.log(notes);

  for (var i = 0; i < notes.length; i++) {
    if (chosen1 === notes[i].id) {
      notes.splice(i, 1);
    }
  }

  fs.writeFile(
    path.join(__dirname + '/db/db.json'),
    JSON.stringify(notes),
    err => {
      if (err) throw err;

      console.log('Done writing');
    }
  );

  return res.json(false);
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log('App listening on PORT' + PORT);
});
