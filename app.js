var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var aws = require('aws-sdk');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var passwordHash = require('password-hash');
var passwordHash = require('./node_modules/password-hash/lib/password-hash');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var integerValidator = require('mongoose-integer');
var testdata = require('./samplemodel');

var mongoose = require('mongoose');
var assert = require('assert');
var url = 'mongodb://localhost:27017/todosDB';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected to server");
    return db;
});

app.get('/',function(req,res){
    res.sendFile(__dirname + "/sample.html");
});

console.log(testdata.carParking);

/*getting all records*/
app.get('/artists',function(req,res){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('artists').find({}).toArray(function(err,docs){
            assert.equal(null, err);
            if (err) throw err;
            var artists = [];
            for (var i=0; i< docs.length;i++){
                var artist_profile = {};
                artist_profile.id = docs[i]._id;
                artist_profile.name = docs[i].name;
                artist_profile.email = docs[i].email;
                artist_profile.price = docs[i].price;
                if(docs[i].hasOwnProperty('profilepic')){
                    artist_profile.profile_pic = "http://10.9.9.102:3000/uploads/"+docs[i].profilepic.filename;  
                }
                else{
                    artist_profile.profile_pic = "http://10.9.9.102:3000/images/person-icon-8.png"; 
                }
                artists.push(artist_profile);
            }
            res.status(200).send(artists);
        });
        db.close();
    });
});

/*getting record based on id*/
app.get('/artist/:id',function(req,res){
    var id = req.params.id;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('artists').find({"_id": ObjectId(id)}).toArray(function(err,docs){
            var artist_profile = {};
            artist_profile.id = docs[0]._id;
            artist_profile.name = docs[0].name;
            artist_profile.description = docs[0].description;
            artist_profile.mobile = docs[0].mobile;
            artist_profile.email = docs[0].email;
            artist_profile.price = docs[0].price;
            artist_profile.location = docs[0].location;
            artist_profile.category = docs[0].category;
            artist_profile.genre = docs[0].genre;
            if(docs[0].hasOwnProperty('profilepic')){
                artist_profile.profile_pic = "http://10.9.9.102:3000/uploads/"+docs[0].profilepic.filename;
            }
            else{
                artist_profile.profile_pic = "http://10.9.9.102:3000/images/person-icon-8.png";
            }
            assert.equal(null, err);
            if (err) throw err;
            res.status(200).send(artist_profile);
        });
        db.close();
    });
});

/*getting feed based on id*/
app.get('/artist/feed/:id',function(req,res){
    var id = req.params.id;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('feeds').find({"artist": ObjectId(id)}).toArray(function(err,docs){
            var feeds = [];
            for (var i=0; i < docs.length;i++){
                var feeddata = {};
                
                feeddata.id = docs[i]._id;
                feeddata.description = docs[i].description;
                feeddata.likes = docs[i].likes;
                feeddata.date = docs[i].date;
               feeddata.media = {};
                if(docs[i].media.hasOwnProperty('filetype')){
                    feeddata.media.type = docs[i].media.filetype;
                    feeddata.media.filename = docs[i].media.filename;
                    feeddata.media.fileurl = "http://10.9.9.102:3000/uploads/"+docs[i].media.filename;
                }
                feeds.push(feeddata);
            }
            res.status(200).send(feeds);
            assert.equal(null, err);
            if (err) throw err;
        });
        db.close();
    });
});


/*posting data to db*/
app.post('/api/records',function(req,res,next){
    console.log(req);
    var mydata = {
        "name" : req.body.name,
        "age" : req.body.age
    };
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('sample').insert(mydata, function(err,result){
            assert.equal(null, err);
            res.send(200).status(result);
            if (err) throw err;
            db.close();
        });
    });
});

app.listen(4001,function(){
    console.log("server listening on port:4001");
});
