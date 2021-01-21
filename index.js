const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require("fs");
const path = require("path");
const app = express()
let apiPort = process.env.PORT;
if (apiPort == null || apiPort == "") {
  apiPort = 5000;
}
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

app.get('/api/assigns', (req, res) => {
    //console.log("get called")
    fs.readFile('./db/assignments.json', 'utf-8', function (err, data) {
        if (err) { throw err; }
        var arrayOfObjects = JSON.parse(data);
        //console.log(arrayOfObjects);
        //console.log(arrayOfObjects.assignments);
        res.send({
            arr: arrayOfObjects
        });
        /*res.send(JSON.stringify({
            arr: arrayOfObjects
        }));*/
    });
})

app.use(express.static(path.join(__dirname, 'build')));

/*app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "public", "index.html"));
})*/

app.put('/api/assigns/:id', (req, res) => {
    //.log('put called');
    let assignId = req.params.id;
    var updatedAssign = req.body;
    //console.log(updatedAssign);
    fs.readFile('./db/assignments.json', 'utf-8', function (err, data) {
        if (err) { throw err; }
        var arrayOfObjects = JSON.parse(data);
        if (assignId < 0 || assignId >= arrayOfObjects.assignments.length) {
            res.send("Illegal id");
        } else {
            arrayOfObjects.assignments[assignId].assignment.sents = updatedAssign.sents;
            arrayOfObjects.assignments[assignId].assignment.secs = updatedAssign.secs;
            fs.writeFile("./db/assignments.json", JSON.stringify(arrayOfObjects), 'utf-8', function(err){
                if (err) throw err;
            });
        }
    })
    res.send("لقد تم تعديل المهمة بنجاح");
})

app.post('/api/assigns', (req, res) => {
    //console.log("post called");
    //console.log(req.body);
    var currentAssign = req.body;
    fs.readFile('./db/assignments.json', 'utf-8', function (err, data) {
        if (err) { throw err; }
        //console.log(data);
        var arrayOfObjects = JSON.parse(data);
        //console.log(arrayOfObjects);
        var len = arrayOfObjects.assignments.length;
        //var currentAssignObj = JSON.parse(currentAssign);
        arrayOfObjects.assignments.push({assignment: currentAssign, id: len});
        //console.log(arrayOfObjects);
        fs.writeFile("./db/assignments.json", JSON.stringify(arrayOfObjects), 'utf-8', function(err){
            if (err) throw err;
        });
        //console.log(arrayOfObjects);
    });
    res.send(
      "لقد تم حفظ المهمة بنجاح",
    );
})

app.delete('/api/assigns/:id', (request, response) => {
    let assignId = request.params.id;
    //console.log("delete called");
    fs.readFile('./db/assignments.json', 'utf-8', function (err, data) {
        if (err) { throw err; }
        var arrayOfObjects = JSON.parse(data);
        var arr = arrayOfObjects.assignments;
        if (arr.length === 0) {
            response.send(JSON.stringify({res: "no saved assignments"}));
        }else{
            let index = arr.findIndex(obj => obj.id == assignId);
            if (index === -1) {
                response.send(JSON.stringify({res: "no such id"}));
            } else{
                arr.splice(index, 1);
                let i = 0;
                while (i < arr.length) {
                    arr[i].id = i++;
                }
                var result = { assignments: arr };
                fs.writeFile("./db/assignments.json", JSON.stringify(result), 'utf-8', function(err){
                    if (err) throw err;
                });
                response.send(JSON.stringify({res: "ok"}));
            }
        }
    });
});

app.delete('/api/assigns', (request, response) => {
    //console.log("delete called");
    var arrayOfObjects = {
        assignments: []
    };
    fs.writeFile("./db/assignments.json", JSON.stringify(arrayOfObjects), 'utf-8', function(err){
        if (err) throw err;
    });
    response.send("لقد تم حذف جميع المهام بنجاح");
});

/*The file ./db/assignments must be of the form: {"assignments":[]} when empty,
and {"assignments":[{"assignment":{"sents":["sentence1", "sentence2"], "secs":2}, "id":0}]} when not empty*/

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
