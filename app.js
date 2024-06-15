const express =  require ("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsymc = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
app.use(express.static(path.join(__dirname,"/public")))



app.set("view engine" ,"ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs' , ejsMate);

async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(() =>{
    console.log("connect to db");
})
.catch(err =>{
    console.log(err);
});

app.listen(8080 , ()=>{console.log("server is listning toport 8080");});
app.get("/", (req,res)=>{
    res.send("hii i am rot");
});

//Index route
app.get("/listings" , async(req,res) =>{
    const allListing =  await Listing.find({});
    res.render("./Listings/index.ejs" , {allListing});
});

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
  });


//Show Route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  });

  
//Create Route
app.post("/listings", async(req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })



//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  });
  
  //Update Route
  app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  });
  
  //Delete Route
  app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  });

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         image: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });


app.use((err , req , res , next) =>{
  res.send("Something Went Wrong");
});