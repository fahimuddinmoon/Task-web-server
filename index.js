const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('task project')
})
app.listen(port, () => {
    console.log(`task running ${port}`)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clvmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db('taskDB').collection('allUsers');
        const taskCollection = client.db('taskDB').collection('allTask');
        //user save
        app.post('/users/:email', async (req, res) => {
            const user = req.body
            const email = req.params.email
            const query = { email }
            const isExist = await usersCollection.findOne(query)
            if (isExist) {
                return res.send(isExist)
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })
        //task post
        app.post('/taskAdded', async (req, res) => {
            const data = req.body
            const result = await taskCollection.insertOne(data)
            res.send(result)
        })
        //task get
        app.get('/taskAdded', async (req, res) => {
            const result = await taskCollection.find().toArray()
            res.send(result)
        })
        //task get (email)
        app.get('/taskAdded/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await taskCollection.find( query).toArray()
            res.send(result)
        })
        //task get (id)
        app.get('/taskAdded/single/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })
        //task delete (id)
        app.delete('/taskDelete/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        app.put('/UpdateTask/:id', async (req, res) => {
            const data = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const UpdateInfo = {
                $set: {
                    category: data?.category,
                    description: data?.description,
                    email: data?.email,
                    time: data?.time,
                    title: data?.title
                }
            }
            const result = await taskCollection.updateOne(filter, UpdateInfo)
            res.send(result)
        })
        app.patch('/category/update/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    category: 'In-Progress'
                }
            }
            const result = await taskCollection.updateOne(filter, updateData)
            res.send(result)
        })
        app.patch('/allcomplete/category/update/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    category: 'Done'
                }
            }
            const result = await taskCollection.updateOne(filter, updateData)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
