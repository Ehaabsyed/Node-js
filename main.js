const express = require('express')
const app = express()


const cookieparser = require('cookie-parser')
const path = require('path')
const userModel = require("./modules/user")
const postSchema = require('./modules/post')
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
    res.cookie("token", "");
    res.render('index')
})
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    let blogs = await postSchema.find()
    let user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: 'No accounts found' });
    }
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            var token = jwt.sign({ email }, 'secret');
            res.cookie("token", token)
            res.render('home', { user,blogs })
        } else {
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
app.get('/users',isLoggedIn, async (req, res) => {
    let users = await userModel.find();
    res.render('users', { users })
})
//delete
app.get('/delete/:id', async (req, res) => {
    let deletedUser = await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect('/users')
})
//delete post
app.get('/deletepost/:id', async (req, res) => {
    let deletedUser = await postSchema.findOneAndDelete({ _id: req.params.id });
    res.redirect('/profile')
})
//edit post
app.get('/edit/:id', async (req, res) => {
    let post = await postSchema.findOne({ _id: req.params.id });
    res.send(post)
})
//profile
app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts")
    res.render('profile', { user })
})
//blogpost
app.get('/blogpost', isLoggedIn, (req, res) => {
    res.render('blogpost')
})
app.post('/submit-blog', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })
    let { title, content } = req.body;
    let post = await postSchema.create({
        user: user.username,
        content,
        title
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/home')
})

app.get('/home', isLoggedIn, async (req, res) => {
    let blogs = await postSchema.find()
    res.render('home', { blogs})
})
function isLoggedIn(req, res, next) {
    if (req.cookies.token == "") {
        return res.status(400).json({ error: 'You must log in' });
    } else {
        let data = jwt.verify(req.cookies.token, "secret")
        req.user = data;
    }
    next()
}

app.listen(4747)