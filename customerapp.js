//declare dependancies
var inquirer = require("inquirer");
var consoletable = require("console.table");
var mysql = require("mysql");

//declare variables
var connection = '';

//declare functions
function connect() {
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "test",
        password: "",
        database: "bamazon"
        });
        
    connection.connect(function(err) {
        if (err) throw err;
        console.log("connected to server" + "\n");
        listProduct();
    });
    
};

function closeConnection() {
    inquirer.prompt([
        {
            name:"doubleconfirm",
            type:"confirm",
            message: "Are you sure you'd like to exit?"
        }
    ]).then(function(confirm){
        if (confirm.doubleconfirm === true){
            connection.end();
            conecction = '';
        }
        else {
            listProduct();
        };
    });
};

function continueConn() {
    inquirer.prompt([
        {
            name:"confirmation",
            type:"confirm",
            message: "Do you want to buy any more items?"
        }
    ]).then(function(confirm){
        if (confirm.confirmation === true){
            listProduct()
        }
        else {
            closeConnection()
        };
    });
};

function listProduct() {
    connection.query ("SELECT * FROM products;", function(err, res){
        if (err) throw err;
        else {
            console.table(res);
        }
    });
    clientPurchase();
};

function clientPurchase(){
    inquirer.prompt([
        {
            name: "idNum",
            type: "input",
            message: "What item ID would you like to buy?"
        },
        {
            name: "purchaseNum",
            type: "input",
            message: "How many would you like to buy?"
        }
    ]).then(function(inquiry) {
        var idNum = inquiry.idNum;
        var purchaseNum = inquiry.purchaseNum;

        connection.query ("SELECT * FROM products WHERE item_id ="+idNum+";" , function(err, res){
            if (err) throw err;

            var price = res[0].price;
            var product_name = res[0].product_name;
            var department_name = res[0].department_name;
            var stock_quantity = res[0].stock_quantity;
            var purchaseCost = price * purchaseNum;
            var stockMath = stock_quantity - purchaseNum;

            if (stock_quantity > purchaseNum) {
                var update = "UPDATE products SET stock_quantity = "+stockMath+" WHERE item_id ="+ idNum+";"
                console.log(update)
                connection.query (update)
                console.log( "Purchase of "+purchaseNum+" "+product_name+" for "+ purchaseCost+" dollars completed.\n")
                continueConn();
            }
            else {
                console.log("Insufficient quantity of stock available for purchase.")
                continueConn();
            };
        });
    });
};

//initialize
connect();