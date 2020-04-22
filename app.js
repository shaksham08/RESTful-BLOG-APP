const express = require("express");
const app = express();
const port = 3000;
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");

var bodyParser = require("body-parser");

app.use(expressSanitizer());
app.use(methodOverride("_method"));

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("public"));

app.set(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now,
  },
});

let Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes
//index route
app.get("/blogs", (req, res) => {
  Blog.find({}, (err, blogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

//new route
app.get("/blogs/new", (req, res) => {
  res.render("new");
});

//create route
// CREATE ROUTE
app.post("/blogs", function (req, res) {
  // create blog
  console.log(req.body);
  req.body.blog.body = req.sanitize(req.body.blog.body);

  console.log("===========");
  console.log(req.body);
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      //then, redirect to the index
      res.redirect("/blogs");
    }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE ROUTE
app.delete("/blogs/:id", function (req, res) {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
  //redirect somewhere
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
