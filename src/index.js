const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const collection = require('./config');

const app = express();

app.use(session({
    secret: 'fewidhbcuhjqiewhjodch', 
    resave: false,
    saveUninitialized: true,
}));

// Using ejs as the view engine
app.set('view engine', 'ejs');

// Data to JSON
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use('/hangman', express.static('public/hangman.html'));

// Static files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup route
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        points: 0, // Initial points
    };

    try {
        const existingUser = await collection.findOne({ email: data.email });

        if (existingUser) {
            res.status(400).send('User already exists. Please choose a different email.');
        } else {
            // Hash the password using bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword;

            const userdata = await collection.insertMany(data);
            console.log(userdata);

            // Store user information in the session after signup
            req.session.user = { email: data.email, points: data.points };

            res.redirect('/hangman.html')
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Login user
app.post('/login', async (req, res) => {
    try {
        const user = await collection.findOne({ email: req.body.email });

        if (!user) {
            res.status(400).send('User not found');
        } else {
            const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);

            if (!isPasswordMatch) {
                res.status(400).send('Invalid Password');
            } else {
                const fetchedPoints = await collection.findOne({ email: req.body.email }).select('points');
                 req.session.user = { email: user.email, points: fetchedPoints };

             

                res.redirect('/hangman.html');
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// Route to increase points when the word is guessed correctly
// Route to increase points when the word is guessed correctly
app.post('/increasePoints', async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            res.status(400).send('User not found');
        } else {
            // Increase points (you can adjust the points increment as needed)
            user.points += 10; // Assuming you want to increase by 10 points
           await collection.findOneAndUpdate(
                { email: user.email },
                { $set: { points: user.points } },
                { returnDocument: 'after' }
              );

            res.json({ message: 'Points increased successfully', points: user.points });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
