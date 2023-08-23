require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./connectDB");
const Album = require('./models/Albums');
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();
app.use(cors());
app.use(express.urlencoded( { extended: true } ));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Get All Albums
app.get("/api/albums", async (req, res) => {
  try {
    const category = req.query.category;
    //const stars = req.query.stars;

    const filter = {};
    if(category) {
      filter.category = category;
    }

    const data = await Album.find(filter);
    
    if (!data) {
      throw new Error("An error occurred while fetching albums.");
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching albums." });
  }
});

// Get A Single Albums
app.get("/api/albums/:slug", async (req, res) => {
  try {
    const slugParam = req.params.slug;
    const data = await Album.findOne({ slug: slugParam});

    if (!data) {
      throw new Error("An error occurred while fetching a album.");
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching albums." });
  }
});



// Create A Album
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
})

const upload = multer({ storage: storage })

app.post("/api/albums", upload.single("thumbnail")  ,async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const newAlbum = new Album({
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
      thumbnail: req.file.filename,
    })

    await Album.create(newAlbum);
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching albums." });
  }
});

// Update A Album
app.put("/api/albums", upload.single("thumbnail"), async (req, res) => {
  try {

    const albumId = req.body.albumId;

    const updateAlbum = {
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
    }

    if (req.file) {
      updateAlbum.thumbnail = req.file.filename;
    }

    await Album.findByIdAndUpdate(albumId, updateAlbum)
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching albums." });
  }
});


app.delete("/api/albums/:id", async(req,res) => {
  const albumId = req.params.id;

  try {
    await Album.deleteOne({_id: albumId});
    res.json("How dare you!" + req.body.albumId);
  } catch (error) {
    res.json(error);
  }
});

app.get("/", (req, res) => {
  res.json("Hello mate!");
});

app.get("*", (req, res) => {
  res.sendStatus("404");
});

app.listen(PORT, ()=> {
  console.log(`Server is running on Port: ${PORT}`);
});