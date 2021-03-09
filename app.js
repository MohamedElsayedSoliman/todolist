//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true });
const itemsSchema ={
name: String
};
const Item=mongoose.model("item",itemsSchema);

const item1 = new Item({

name: "Welcome to your first todolist!"

});
const item2 = new Item({

name: "Hit the + to insert new Items."

});
const item3 = new Item({

name: "Hit this check box to delete item."

});
const defaultItems=[item1,item2,item3];
const listSchema= {
name: String,
items: [itemsSchema]
};
const List =mongoose.model("list",listSchema);
/**/

app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) { // {} indicate find all

    if (founditems.length ===  0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully inserted");
        }

      });
       res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      });
    }


  });

});

app.post("/delete", function(req, res){

const checkedIdNumber = req.body.checkbox.trim();
const ListName= req.body.listName;

if(ListName==="Today"){
  Item.findByIdAndRemove(checkedIdNumber,function(err){

    if (!err) {
      console.log("deleted successfully");
      res.redirect("/");
    }

  });
} else {

  List.findOne({listName: listName}, function(err,doc){
        doc.list.pull({_id:checkedIdNumber });
        doc.save();
        res.redirect("/" + listName);
      });


}


  });



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({

  name: itemName

  });


if(listName ==="Today"){
  item.save();
  res.redirect("/");
} else{

List.findOne({name:listName},function(err,founditems){

founditems.items.push(item);

founditems.save();
res.redirect("/"+listName);
})



}


});

app.get("/:lists", function(req,res){
//  res.render("list", {listTitle: "Work List", newListItems: workItems});
const listName =_.capitalize(req.params.lists);


List.findOne({name:listName},function(err,founditems){

  if (!err) {
    if(!founditems) {
      const list= new List({
      name: listName,
      items: defaultItems

      })
      list.save();
res.redirect("/"+ listName);
  } else {
    res.render("list", {
      listTitle: founditems.name,
      newListItems: founditems.items
    });
  }
}
});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
