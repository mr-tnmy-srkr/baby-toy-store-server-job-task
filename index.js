const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());
app.use(
  cors({
    // origin: ["http://localhost:5173", "http://localhost:5174"],
    origin: ["https://baby-toy-store-job-task.surge.sh/"],
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@myprojectscluster.drcktji.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();
    const brandCollection = client.db("babyToyStoreDB").collection("brandDB");
    const productCollection = client
      .db("babyToyStoreDB")
      .collection("products");
    const cartProductCollection = client
      .db("babyToyStoreDB")
      .collection("cartItems");

    app.get("/allBrands", async (req, res) => {
      const result = await brandCollection.find().toArray();
      res.send(result);
    });

    app.post("/addProducts", async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      // console.log(result);
      res.send(result);
    });

    app.get("/allBrands/:brandName", async (req, res) => {
      const brand = req.params.brandName;
      const query = { brand: brand };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/allBrands/:brandName/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.post("/addToCart", async (req, res) => {
      const product = req.body;
      const result = await cartProductCollection.insertOne(product);
      res.send(result);
    });

    app.get("/myCart", async (req, res) => {
      const cursor = cartProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.put("/product/updateProduct/:brandName/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          brand: data.brand,
          image: data.image,
          name: data.name,
          price: data.price,
          rating: data.rating,
          description: data.description,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });
    app.delete("/deleteCartItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartProductCollection.deleteOne(query);
      res.send(result);
    });
    
    // Send a ping to confirm a successful connection
    client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Baby toy server is running");
});

app.listen(port, () => {
  console.log(`Baby toy server is listening on port ${port}`);
});
