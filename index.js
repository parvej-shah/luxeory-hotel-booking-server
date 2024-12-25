require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// Mongo DB Connections
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@newcluster.n9akf.mongodb.net/?retryWrites=true&w=majority&appName=newCluster`;

// Middleware Connections
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://job-portal-504b7.web.app",
      "https://job-portal-504b7.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' });
  }

  // verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' });
      }
      req.user = decoded;
      next();
  })
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const roomsCollection = client.db("hotelDB").collection("rooms");
    const bookingsCollection = client.db("hotelDB").collection("bookings");
    const reviewsCollection = client.db("hotelDB").collection("reviews");
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // auth related APIs
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    app.get("/rooms", async (req, res) => {
      const { sortBy } = req.query; // Get sorting criteria from query parameters

      // Default sorting values
      const sortField = sortBy || "reviewCount"; // Default field to sort by
      // const sortOrder = order === 'desc' ? -1 : 1; // Default order is ascending

      const result = await roomsCollection
        .find()
        .sort({ [sortField]: -1 })
        .toArray();
      res.send(result);
    });
    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const newBooking = req.body;
      const filter = { _id: new ObjectId(newBooking.roomId) };
      const updateDoc = {
        $set: {
          available: false,
        },
      };
      const result1 = await roomsCollection.updateOne(filter, updateDoc);
      const result = await bookingsCollection.insertOne(newBooking);
      res.send(result);
    });
    app.get("/bookings/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const results = await bookingsCollection.find(query).toArray();
      for (const result of results) {
        const filter = { _id: new ObjectId(result.roomId) };
        const data = await roomsCollection.findOne(filter);
        if (data) {
          result.thumbnail = data.thumbnail;
          result.price = data.price;
          result.roomTitle = data.roomTitle;
        }
      }
      res.send(results);
    });
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const date = req.body.newDate;
      const roomId = req.body.roomId;
      const filter2 = { _id: new ObjectId(roomId) };
      const updatedDoc = {
        $set: {
          available: false,
        },
      };
      const result1 = await roomsCollection.updateOne(filter2, updatedDoc);
      const filter = { _id: new ObjectId(id) };
      const updatedDate = {
        $set: {
          bookingDate: date,
        },
      };
      const result = await bookingsCollection.updateOne(filter, updatedDate);
      res.send(result);
    });
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const { roomId } = req.query;
      const filter2 = { _id: new ObjectId(roomId) };
      const updatedDoc = {
        $set: {
          available: true,
        },
      };
      const result1 = await roomsCollection.updateOne(filter2, updatedDoc);
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const filter = { _id: new ObjectId(newReview.roomId) };
      const updateDoc = {
        $inc: {
          reviewCount: 1,
        },
      };
      const result1 = await roomsCollection.updateOne(filter, updateDoc);
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    });
    app.get("/reviews", async (req, res) => {
      const roomId  = req.query.roomId;
      let filter;
      if(roomId){
        filter ={roomId}
      }
      else{
        filter = {};
      }
      const sortField = "timestamp"; 
      const result = await reviewsCollection
        .find(filter)
        .sort({ [sortField]: -1 })
        .toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    /* await client.close(); */
  }
}
run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
  res.send("Luxeory is running");
});
// Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
