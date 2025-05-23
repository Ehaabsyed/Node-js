const express = require('express')
const app = express();
const path = require('path')
const fs = require('fs');
const { error } = require('console');

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
//home
app.get('/', (req, res) => {
    fs.readdir('./files', (error, files) => {
        res.render('index', { files: files })
    })
})
//read file
app.get('/files/:name', (req, res) => {
    fs.readFile(`./files/${req.params.name}`, "utf-8",(err, data) => {
        res.render('show',{data:data, name:req.params.name.split(".")[0]})
    })
})
//delete file
app.get('/delete/:file', (req, res) => {
    fs.unlink(`./files/${req.params.file}`,(error)=>{
        res.redirect('/') 
    })
})
//submit the task
app.post('/submit-task', (req, res) => {
    fs.writeFile(`./files/${req.body.taskTitle.split(" ").join("")}.txt`, `${req.body.taskDescription}`, (err) => {
        res.redirect('/')
    })
})
//edit file name
app.get("/edit/:name",(req,res)=>{
    res.render('edit',{name:req.params.name})
})
app.post("/edit",(req,res)=>{
    // console.log(req.body.previous)
    fs.rename(`./files/${req.body.previous}`,`./files/${req.body.new}.txt`,function(err){
        res.redirect('/')
    })
})






app.listen(6969)