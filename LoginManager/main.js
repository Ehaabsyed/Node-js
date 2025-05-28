const express = require('express')
const app = express()


const cookieparser = require('cookie-parser')
const path = require('path')
const userModel = require("./modules/user")
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieparser())

app.get('/', (req, res) => {
    res.render('index')
})

//login
app.get('/login', (req, res) => {
    res.render('index')
})
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    let existingUser = await userModel.findOne({ email });
    if (!existingUser) {
        return res.status(400).json({ error: 'No accounts found' });
    }
    bcrypt.compare(password, existingUser.password, function (err, result) {
        if (result) {
            var token = jwt.sign({ email }, 'secret');
            res.cookie("token", token)
            res.render('home')
        }else{
                    return res.status(400).json({ error: 'No accounts found' });
        }
    })

})

//signup
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.post('/signup', async (req, res) => {
    let { name, username, email, password } = req.body;

    let existingUser = await userModel.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'email already exists' });
    }

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            // Store hash in your password DB.
            let createdUser = await userModel.create({
                name,
                username,
                email,
                password: hash
            })
            var token = jwt.sign({ email }, 'secret');
            res.cookie("token", token)
            res.render('home')
        });
    });
})

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/')
})
//users
app.get('/users',async (req, res) => {
    let users=await userModel.find();
    res.render('users',{users})
})
//delete
app.get('/delete/:id',async (req, res) => {
    let deletedUser=await userModel.findOneAndDelete({_id:req.params.id});
    res.redirect('/users')
})




app.get('/home', (req, res) => {
    res.render('home')
})

app.listen(4747)