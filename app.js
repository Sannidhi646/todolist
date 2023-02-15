const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.set("strictQuery", true);
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//conection of mongose
mongoose.connect("mongodb://Localhost:27017/todolistDB", {
  useNewUrlParser: true,
});
//mongoose schema
const itemsSchema = {
  name: String,
};
//creating model
const Item = mongoose.model("Item", itemsSchema);
//values which we need
const item1 = new Item({
  name: "Welcome to our to-do list",
});
const item2 = new Item({
  name: "Hit the + button to add new Item",
});
const item3 = new Item({
  name: "<-- Hit this to delete",
});

//storing all this in an array
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  //toshow in frontend
  //here itemsinarray is an array
  Item.find({}, function (err, itemsinarray) {
    //to check whether the array is 0 or not
    if (itemsinarray.length == 0) {
      //insert to db
      Item.insertMany(defaultItems, function (err) {
        if (err) console.log(err);
        else console.log("sucess");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: itemsinarray });
    }
  });
});

app.post("/", function (req, res) {
  const newitem = req.body.newItem;
  const listname = req.body.list;
  
  const NewItem = new Item({
    name: newitem
  });
  if (listname === "Today") {
  
    NewItem.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listname},function(err,answer)
    {
      answer.items.push(NewItem);
      answer.save();
      res.redirect("/"+listname);
    })
  }
});
app.get("/:customeListName", function (req, res) {
  const CustomeListName = _.capitalize(req.params.customeListName);
  // if name is laready there then no need to add else add
  //here result is an object
  List.findOne({ name: CustomeListName }, function (err, result) {
    if (err) console.log(err);
    else if (result) {
      res.render("list", {
        listTitle: result.name,
        newListItems: result.items,
      });
    } else {
      const list = new List({
        name: CustomeListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + CustomeListName);
    }
  });
});

app.post("/delete", function (req, res) {
  const id = req.body.Checkbox;
  const listname=req.body.listname;
  if(listname==="Today")
  {
    Item.findByIdAndRemove(id, function (err) {
      if (err) console.log(err);
      else {
        console.log("sucefully delete");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:id}}},function(err,ansewer){
      if(!err)
      {
        res.redirect("/"+listname);
      }
    })
  }
  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
