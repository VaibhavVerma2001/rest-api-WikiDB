const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));


const URL = process.env.DB_CONNECT;
mongoose.connect(URL);

mongoose.connection
    .once('open', function () {
        console.log('Successfully connected to Database ...');
    })
    .on('error', function (err) {
        console.log(err);
    });

const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model("Article", articleSchema);

////////////// Request targeting all the articles //////////////
// FETCH ALL ARTICLES -- GET  ROUTE
app.get("/", (req, res) => {
    res.send("hello world!");
});

app.get("/articles", (req, res) => {
    Article.find({}, function (err, articles) {
        if (err) {
            res.send("ERROR : ", err);
        }
        else {
            res.send(articles);
        }
    });
});


// Create one new article -- POST route
// problem -- since this is API we dont have fronted to send data using post request
// this is solved using postman
app.post("/articles", (req, res) => {
    // like in form feilds we had name
    // send the values through postman post request after selecting -- body and x-www-form-urlencoded
    // console.log(req.body.title);
    // console.log(req.body.content);

    // now save in DB
    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    });

    newArticle.save(function (err) {
        if (err) {
            res.send("ERROR : ", err);
        }
        else {
            res.send("New article is added successfully");
        }
    });
});


//DELETE --  deletes all the articles
// select delete in postman
app.delete("/articles", (req, res) => {
    // how server will respond when user requests to delete all articles
    Article.deleteMany({}, function (err) {
        if (err) {
            res.send("ERROR : ", err);
        }
        else {
            res.send("Successfully deleted all articles");
        }
    });
});



// chained route handlers -- to handle multiple thing to same route
// app.route("/articles")
//   .get((req, res) => {
//     Article.find({} , function(err,articles){
//         if(err)
//         {
//             res.send("ERROR : " , err);
//         }
//         else 
//         {
//             res.send(articles);
//         }
//     });
//   })
//   .post((req, res) => {
//     const newArticle = new Article({
//         title : req.body.title,
//         content : req.body.content
//     });

//     newArticle.save(function(err){
//         if(err)
//         {
//             res.send("ERROR : " , err);
//         }
//         else 
//         {
//             res.send("New article is added successfully");
//         }
//     });
//   })
//   .delete((req,res)=>{
//     Article.deleteMany({} , function(err)
//     {
//         if(err)
//         {
//             res.send("ERROR : " ,err);
//         }
//         else 
//         {
//             res.send("Successfully deleted all articles");
//         }
//     }); 
//   });


////////////// Request targeting specific article /////////////

//get specific article
app.get("/articles/:articleTitle", (req, res) => {
    Article.findOne({ title: req.params.articleTitle }, function (err, foundArticle) {
        if (err) {
            res.send("ERROR : ", err);
        }
        else {
            if (foundArticle) {
                res.send(foundArticle);
            }
            else {
                res.send("No Article Found.");
            }
        }
    });
});


//update specific article -- put method -- updates whole doc. if we update only content not title then it will erase those title feilds(if any feild we dont provide then that will neglect that)
app.put("/articles/:articleTitle", (req, res) => {
    // (where , what , callback function)
    const articleTitle = req.params.articleTitle;
    Article.updateMany({ title: articleTitle },{ title: req.body.title,content: req.body.content },function (err) {
            if (!err) {
                res.send("Successfully updated the selected article.");
            } else {
                console.log(err);
                res.send(err);
            }
        });
});

//update specific article -- patch method -- updates only changed feild
// -- use $set to update only feilds provided
app.patch("/articles/:articleTitle", (req, res) =>{
    const articleTitle = req.params.articleTitle;
    Article.updateMany({title: articleTitle} , {$set : {title : req.body.title , content: req.body.content}} ,function(err){
        if(err)
        {
            console.log(err);
            res.send("ERROR : ", err);
        }
        else 
        {
            res.send("Successfully updated the selected article.");
        }
    });
});

// delete a specific article -- all articles with same title
app.delete("/articles/:articleTitle", (req, res) =>{
    const articleTitle = req.params.articleTitle;
    Article.deleteMany({title : articleTitle} , function(err){
        if(err)
        {
            console.log(err);
            res.send("ERROR : ",err);
        }
        else
        {
            res.send("Selected article deleted successfully.")
        }
    });
});


const port = process.env.PORT || 3000 ;
app.listen(port, (req, res) => {
    console.log(`sever running on port ${port}...`);
});