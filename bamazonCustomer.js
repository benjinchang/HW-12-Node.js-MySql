var mysql      = require('mysql');
var inquirer = require('inquirer');

var order = 0;
var quantity = 0;
var purchaseMade = false;
var itemPrice = 0;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "WebsitePass12!@",
  database: "bamazon"
});

function listProducts () {    
  connection.query("SELECT * FROM products", function(err, res) {
    if (purchaseMade === false) {
      console.log("Items");
      console.log("________________________________________________________________");
    }    
    else if (purchaseMade === true) {
      console.log("");
      console.log("Remaining Items");
      console.log("****************************************************************");
    }
    for (var i = 0; i < res.length; i++) {
      console.log("Item # " + res[i].item_id + " | " + res[i].product_name + " | " + "Price: " + res[i].price + " | " + "QTY: " + res[i].stock_quantity);
    }
    if (purchaseMade === false) {
      itemPicked ();  
    }    
    else if (purchaseMade === true) {
      totalCost ();
    }
  });
}

var itemPicked = function() {
  console.log("");
  inquirer.prompt({
    name: "item_id",
    type: "input",
    message: "What would you like to buy? (Enter in item #)"
  }).then(function(answer) {
    order = answer.item_id;
    orderQuantity();

  });
};

function orderQuantity () {
  inquirer.prompt({
    name: "item_quantity",
    type: "input",
    message: "How many would you like to buy?"
  }).then(function(answer) {
    var query = "SELECT * FROM products";
    quantity = answer.item_quantity;
    placeOrder();
  });

}

function placeOrder () {
  // if purchase is made don't rerun line 27 show total purchase cost instead
  purchaseMade = true;
  var query = "SELECT * FROM products";
  connection.query(query, function(err, res) {
    var itemNum = order - 1;
    var quantityAvailable = res[itemNum].stock_quantity;
    itemPrice = res[itemNum].price;
    
    if (quantity <= quantityAvailable) {
      connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?",[quantityAvailable-quantity,order], function(err, res) {
        listProducts ();
      });

    }
    else if (quantity > quantityAvailable) {
      console.log("");
      console.log("Insufficient quantity!"); 
      console.log("Please enter a lower quantity lower than or equal to " + quantityAvailable);
      console.log("");
      orderQuantity ();
    }
  });
}

function totalCost () {
  var cost = quantity * itemPrice;
  console.log("================================================================");
  console.log("Your total is $" + cost);
  connection.end();
}

connection.connect(function(err) {
  if (err) throw err;
  listProducts();
});