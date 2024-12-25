require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// Mongo DB Connections
const uri =
 `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@newcluster.n9akf.mongodb.net/?retryWrites=true&w=majority&appName=newCluster`;

// Middleware Connections
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const roomsCollection = client.db("hotelDB").collection("rooms");
    const bookingsCollection = client.db("hotelDB").collection("bookings");
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    app.get('/rooms',async (req,res)=>{
      const cursor = roomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      console.log("booking your room")
      const newBooking = req.body;
      const filter = {_id:new ObjectId(newBooking.roomId)};
      const updateDoc = {
        $set: {
          available: false
        },
      };
      const result1 = await roomsCollection.updateOne(filter, updateDoc);
      const result = await bookingsCollection.insertOne(newBooking);
      res.send(result);
    });
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email};
      console.log(email);
      const results = await bookingsCollection.find(query).toArray();
      for(const result of results){
        const filter = {_id:new ObjectId(result.roomId)};
        const data = await roomsCollection.findOne(filter)
        if(data){
          result.thumbnail = data.thumbnail;
          result.price = data.price;
          result.roomTitle = data.roomTitle;
        }
      }
      res.send(results);
    });
    app.patch('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const date = req.body.newDate;
      const roomId = req.body.roomId;
      const filter2 = {_id:new ObjectId(roomId)};
      const updatedDoc = {
        $set: {
          available: false
        },
      }
      const result1 = await roomsCollection.updateOne(filter2,updatedDoc);
      const filter = {_id:new ObjectId(id)};
      const updatedDate = {
        $set: {
          bookingDate: date
        },
      }
      const result = await bookingsCollection.updateOne(filter,updatedDate);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    /* await client.close(); */
  }
}
run().catch(console.dir);

// Routes
app.get("/",(req, res) => {
  res.send("Luxeory is running");
});
// Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
