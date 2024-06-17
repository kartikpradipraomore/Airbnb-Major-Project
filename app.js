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
const {listingSchema} = require("./schema.js");

 
app.use(express.static(path.join(__dirname,"/public")));


app.set("view engine" ,"ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs' , ejsMate);

const validateListing = (req,res,next)=>{
  let {error} = listingSchema.validate(req.body);
  if(error){
    throw new ExpressError(400, error);
  }else{
    next();
  }
} 

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
app.get("/listings" , wrapAsymc (async(req,res) =>{
    const allListing =  await Listing.find({});
    res.render("./Listings/index.ejs" , {allListing});
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
  });


//Show Route
app.get("/listings/:id", wrapAsymc (async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  }));

  
//Create Route
app.post("/listings", validateListing,
  wrapAsymc (async(req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }));

//Edit Route
app.get("/listings/:id/edit", wrapAsymc (async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }));
  
  //Update Route
  app.put("/listings/:id",validateListing,
     wrapAsymc (async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  app.delete("/listings/:id", wrapAsymc( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  }));
  

app.all("*", (req,res,next)=>{
  next(new ExpressError(404, "Page Not Found"))
});

app.use((err , req , res , next) => {
  let {statusCode=500, message="Somthing Went Wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs" , {message})
});

