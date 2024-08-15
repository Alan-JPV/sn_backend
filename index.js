const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const port = 5000;
let db;
const ObjectId = require('mongodb').ObjectId;


async function mongoConnect() {
    let client = new MongoClient('mongodb+srv://alan:sneakerhead@sneakerhead.onnvt.mongodb.net/?retryWrites=true&w=majority&appName=sneakerhead');
    await client.connect();
    db = client.db('sneakerhead');
 }

app.use(cors());
app.use(express.json());

app.get('/users',async function(req,res){
    let output = await db.collection('user').find({}).toArray();
    res.json(output);
  })
  
  app.post('/users',async function (req,res) {
    let output = await db.collection('user').insertOne(req.body);
    console.log(req.body);
    res.json(output);
  })

const bcrypt = require('bcrypt');


// app.post('/login', async function(req, res) {
//   console.log('Login attempt:', req.body);
//   const { username, password } = req.body;
//   try {
//       let usr = await db.collection('user').findOne({ username, password });
//       if (usr) {
//           console.log('Login successful:', usr);
//           res.json({ success: true, usr });
//       } else {
//           console.log('Invalid USER or PASS');
//           res.json({ success: false, message: 'Invalid USER or PASS' });
//       }
//   } catch (error) {
//       console.error('Error during login:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

//cht
app.post('/login', async function(req, res) {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;
  
  try {
      // Find the user by username
      let usr = await db.collection('user').findOne({ username });
      
      if (usr) {
          // Compare the provided password with the stored password
          if (usr.password === password) {
              console.log('Login successful:', usr);
              res.json({ success: true, usr });
          } else {
              console.log('Invalid USER or PASS');
              res.json({ success: false, message: 'Invalid USER or PASS' });
          }
      } else {
          console.log('Invalid USER or PASS');
          res.json({ success: false, message: 'Invalid USER or PASS' });
      }
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/profile', async function(req, res) {
    const { username } = req.query;

    try {
        const usr = await db.collection('user').findOne({ username });

        if (usr) {
            res.json({ success: true, usr });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// product list
app.get('/products', async (req, res) => {
  try {
      const products = await db.collection('products').find({}).toArray();
      res.json(products);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new product
app.post('/products', async (req, res) => {
  try {
      const product = req.body;
      const result = await db.collection('products').insertOne(product);
      res.json(result);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const product = req.body;
      const result = await db.collection('products').updateOne({ _id: new MongoClient.ObjectId(id) }, { $set: product });
      res.json(result);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const result = await db.collection('products').deleteOne({ _id: new MongoClient.ObjectId(id) });
      res.json(result);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/wishlist', async function (req, res) {
  try {
      let output = await db.collection('wishlist').insertOne(req.body);
      res.json(output);
  } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all products in the wishlist
app.get('/wishlist', async function (req, res) {
  try {
      let output = await db.collection('wishlist').find({}).toArray();
      res.json(output);
  } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/wishlist/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const wishlist = req.body;
        const {id} = req.params.id;
        const result = await db.collection('wishlist').deleteOne(wishlist.id);
        if (result.deletedCount === 1) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/cart', async function (req, res) {
    try {
        const product = req.body;
        const existingProduct = await db.collection('cart').findOne({ _id: new ObjectId(product._id) });

        if (existingProduct) {
            return res.status(400).json({ error: 'Product already in cart' });
        }

        const result = await db.collection('cart').insertOne(product);
        res.json({ success: true, message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/cart', async function(req, res) {
    try {
        const cartItems = await db.collection('cart').find({}).toArray();
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});
app.delete('/cart/:id', async function (req, res) {
    try {
        const product = req.body;
        const {id} = req.params.id;
        const result = await db.collection('cart').deleteOne(product.id);

        if (result.deletedCount === 1) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Product not found in cart' });
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/',(req,res)=>res.send('joseph is live at port '+port));
app.listen(port,function(){
  console.log('Server runs at : '+port);
  mongoConnect();
});

