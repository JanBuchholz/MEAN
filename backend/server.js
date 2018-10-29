// ***********************************************************************
// * Init
// ***********************************************************************

const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    Issue = require('./models/Issue');

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use('/', router);


// ***********************************************************************
// * Websocket - Port 4001
// ***********************************************************************
var http = require('http').createServer();
http.listen(4001);

var websocket = require('socket.io')(http);

//Timer ... alle 5 Sekunden
old_issues = {};
setInterval(function () {

    // Define notice
    var notice = '';

    Issue.find((err, issues) => {
        if (err)
            console.log(err);
        else {

            if (JSON.stringify(issues) !== JSON.stringify(old_issues)) {
                //Date
                var d = new Date();
                var n = d.toString();
                console.log(n + ' : Data change detected. Sending notice ....');
                
                //Schreib objekt ins lokale und schicke notice
                old_issues = issues;
                notice = 'check';
                websocket.emit('change', notice);
            }
        }
    });
}, 5000);


// ***********************************************************************
// * DB Verbindung
// ***********************************************************************
mongoose.connect('mongodb://localhost:27017/issues');
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});



// ***********************************************************************
// * Routes
// ***********************************************************************
router.route('/issues').get((req, res) => {
    Issue.find((err, issues) => {
        if (err)
            console.log(err);
        else
            res.json(issues);
    });
});

router.route('/issues/:id').get((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (err)
            console.log(err);
        else
            res.json(issue);
    });
});

router.route('/issues/add').post((req, res) => {
    let issue = new Issue(req.body);
    issue.save()
        .then(issue => {
            res.status(200).json({ 'issue': 'Added successfully' });
        })
        .catch(err => {
            res.status(400).send('Failed to create new record');
        });
});

router.route('/issues/update/:id').put((req, res) => {
    Issue.findById(req.params.id, (err, issue) => {
        if (!issue)
            return next(new Error('Could not load document'));
        else {
            issue.title = req.body.title;
            issue.responsible = req.body.responsible;
            issue.description = req.body.description;
            issue.severity = req.body.severity;
            issue.status = req.body.status;

            issue.save().then(issue => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

router.route('/issues/delete/:id').delete((req, res) => {
    Issue.findByIdAndRemove({ _id: req.params.id }, (err, issue) => {
        if (err)
            res.json(err);
        else
            res.json('Remove successfully');
    })
})




// ***********************************************************************
// * Server listen
// ***********************************************************************

app.listen(4000, () => console.log('Server running on port 4000'));