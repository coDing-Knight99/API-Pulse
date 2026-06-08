import express from 'express';
const app = express();
const PORT = 3001;
app.use(express.json());
app.get('/users', (req, res) => {
    console.log("User service received request for /users");
    res.json([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ])
});
app.post('/create_user', (req, res) => {
    console.log("User service received request to create user with data:");
    const username=req.body?.username;
    const password=req.body?.password;
    console.log(username,password);
    res.status(201).json({ message: 'User created successfully' });
});

app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});