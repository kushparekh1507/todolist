//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const lodash = require('lodash');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://kushparekh943:Kush1507@cluster0.ugv2ato.mongodb.net/todolistDB');

const app = express();

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to To do list"
});
const item2 = new Item({
  name: "Hit + button to add new item"
});
const item3 = new Item({
  name: "<--  Hit this button to delete an item"
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
})
const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", function (req, res) {
  async function readItems() {
    const items = await Item.find({});
    // console.log(items);
    if (items.length == 0) {
      Item.insertMany([item1, item2, item3]);
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  }
  readItems();
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listTitle = req.body.list;
  // console.log(listTitle);

  const newItem = new Item({
    name: item
  });
  if (listTitle === "Today") {
    newItem.save();
    res.redirect("/");
  }
  else {
    async function insertItem() {
      const foundList = await List.findOne({ name: listTitle });
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listTitle);
    }
    insertItem();
  }


});

app.get("/:customName", function (req, res) {
  const customName = lodash.lowerCase(req.params.customName);
  // console.log(customName);

  async function readItems() {
    const foundItems = await List.findOne({ name: customName });

    if (!foundItems) {
      //create a new list
      const list = new List({
        name: customName,
        items: [item1, item2, item3]
      });
      list.save();
      res.redirect(`/${customName}`);
    }
    else {
      //show an existing list
      // console.log(foundItems);
      res.render("list", { listTitle: customName, newListItems: foundItems.items });
    }
  }
  readItems();
})

app.post("/delete", function (req, res) {
  const itemID = req.body.itemID;
  const listTitle = req.body.listTitle;
  console.log(itemID);
  console.log(listTitle);

  async function deleteItem() {
    if (listTitle === "Today") {
      await Item.findByIdAndDelete(itemID);
      res.redirect("/");
    }
    else {
      await List.updateOne({ name: listTitle }, { $pull: { items: { _id: itemID } } });
      res.redirect("/" + listTitle);
    }
  }

  deleteItem();
})



// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
