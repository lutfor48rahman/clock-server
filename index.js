const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fd2uk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
    // console.log('abc');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("clockTools").collection("tools");
        const reviewsCollection = client.db("clockTools").collection("reviews");
        const usersCollection = client.db("clockTools").collection("users");
        const userCollection = client.db("clockTools").collection("user");
        const adminCollection = client.db("clockTools").collection("user");
        const orderCollection = client.db("clockTools").collection("order");


        // load all tool 
        app.get('/tools', async (req, res) => {
            const query = {};

            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools)
        })
        // load tool by id
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const tools = await toolsCollection.findOne(query);
            res.send(tools)
        })
        // post the users
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const user = await usersCollection.insertOne(newUser);
            res.send(user);


        })

        // get reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            // const authorization = req.headers.authorization;
            // console.log('auth header', authorization);
            const cursor = reviewsCollection.find(query);
            const review = await cursor.toArray();
            res.send(review)
        })
        // post reviews
        app.post('/reviews', async (req, res) => {
            const newProduct = req.body;
            const review = await reviewsCollection.insertOne(newProduct);
            res.send(review);


        })
        // orders  ..
        app.post('/order', async (req, res) => {
            const newProduct = req.body;
            const review = await orderCollection.insertOne(newProduct);
            res.send(review);


        })
        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools)
        })
        // delete order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })
        // user
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }

        })
        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const fitter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(fitter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ result, token })
        })
    } finally {

    }
}
run().catch(console.dir);





app.get('/', async (req, res) => {
    res.send('Clock Manufecture Store!!!')
})


app.listen(port, () => {
    console.log(`listening from house or shop cleaner  ${port}`)
})