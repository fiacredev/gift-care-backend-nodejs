import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import fs from 'fs'
const salt = 10;

const jsonData = JSON.parse(fs.readFileSync('data.json'));

const app = express();
app.use(cors({
  origin:["http://localhost:3000"],
  methods:["POST","GET","PUT","DELETE"],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "employeeSystem",
});

db.connect(err => {
  if(err) throw err;
  console.log("database connected successfuly OTF 4sure..");
  // deal with inserting data
  // jsonData.forEach(item=>{
  //   const query = 'INSERT INTO durkvon (id,first_name,last_name,email,gender,phone) VALUES(?, ?, ?, ?, ?, ?)';
  //   db.query(query,[item.id, item.first_name, item.last_name, item.email, item.gender,item.phone],(err,results)=>{
  //     if(err) throw err;
  //     console.log(`inserted:${item.first_name}`);
  //   })
  // })
  // // deal with closing the connection
  // db.end();
})

// variable to verify the user in order to access the system

const verifyUser = (req,res,next) =>{
  const token = req.cookies.token;
  if(!token){
    return res.json({Error:"You are not authenticated !! log in to the system"});
  }else{
    jwt.verify(token, "jwt-secret-key", (err,decoded)=>{
      if(err){
        return res.json({Error:"Token isn't okay"});
      }else{
        req.name = decoded.name;
        next();
      }
    })
  }
}

app.get("/auth",verifyUser,(req,res)=>{
  return res.json({Status:"Success",name:req.name});
})

app.post("/api/signup",(req,res)=>{
  const sql = "INSERT INTO access (`name`,`email`,`password`) VALUES(?)";  
  bcrypt.hash(req.body.password.toString(),salt,(err,hash)=>{
    if(err) return res.json({Error:"error through hashing password"});
    const values = [
      req.body.name,
      req.body.email,
      hash
    ]
    db.query(sql,[values],(err,result)=>{
      if(err) console.log(err);
      res.send("values inserted");
    })
  })
})

app.get("/logout",(req,res)=>{
  res.clearCookie("token");
  return res.json({Status:"Success"});
})

app.post("/login",(req,res)=>{
  const sql = "SELECT * FROM access WHERE email = ? ";
  db.query(sql,[req.body.email],(err,data)=>{
      if(err) return res.json({Error:"Log In Error On Server"});
      if(data.length > 0){
          bcrypt.compare(req.body.password.toString(),data[0].password,(err,response)=>{
              if(err) return res.json({Error:"PassWord Compare Errror"});
              if(response){
                  const name = data[0].name;
                  const token = jwt.sign({name},"jwt-secret-key",{expiresIn:'1d'});
                  res.cookie('token',token);
                  return res.json({Status:"Success"});
              }else{
                  return res.json({Error:"PassWord Not Matched"});
              }
          })
      }else{
          return res.json({Error:"No Email Existed"});
      }
  })
})


app.post("/create", (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const dateHired = req.body.dateHired;

  db.query(
    "INSERT INTO employees (name, email, dateHired) VALUES (?,?,?)",
    [name,email, dateHired],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values Inserted");
      }
    }
  );
});

app.post("/decision/create",(req,res)=>{
  const name = req.body.name;
  const idea = req.body.idea;
  db.query(
    "INSERT INTO decision (name,idea) VALUES(?,?)",
    [name,idea],
    (err,result)=>{
      if(err){
        console.log(err);
      }else{
        res.send("decision Room values Created");
      }
    }
  )
})


app.post("/inventory/create", (req, res) => {

  const productName = req.body.productName;
  const supplierName = req.body.supplierName;
  const supplierEmail = req.body.supplierEmail;
  const expirationDate = req.body.expirationDate;
  const productPrice = req.body.productPrice;
  const productQuantity = req.body.productQuantity;
  const orderNumber = req.body.orderNumber;
  const productDescription = req.body.productDescription;

  db.query(
    "INSERT INTO inventory (productName, supplierName, supplierEmail, expirationDate, productPrice, productQuantity, orderNumber , productDescription) VALUES (?,?,?,?,?,?,?,?)",
    [productName,supplierName,supplierEmail,expirationDate,productPrice,productQuantity,orderNumber,productDescription],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values Inserted");
      }
    }
  );
});


app.get("/employees", (req, res) => {
  db.query("SELECT * FROM employees", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/durkvon",(req,res)=>{
  db.query("SELECT * FROM durkvon",(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  })
})


app.get("/inventory", (req, res) => {
  db.query("SELECT * FROM inventory", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/typeShii",(req,res)=>{
  db.query("SELECT * from type",(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  })
})

app.get("/decision",(req,res)=>{
  db.query("select * from decision",(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  })
})

app.put("/update/:id", (req, res) => {

  const id = req.params.id;
  const {name,email,dateHired} = req.body;

  db.query(
    "UPDATE employees SET name = ?, email = ?, dateHired = ? WHERE id = ?",
    [name,email,dateHired,id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});


app.put("/inventory/update", (req, res) => {

  const productName = req.body.productName;
  const supplierName = req.body.supplierName;
  const supplierEmail = req.body.supplierEmail;
  const expirationDate = req.body.expirationDate;
  const productPrice = req.body.productPrice;
  const productQuantity = req.body.productQuantity;
  const orderNumber = req.body.orderNumber;
  const productDescription = req.body.productDescription;


  db.query(
    "UPDATE inventory SET productName = ? , supplierName = ?, supplierEmail = ?, expirationDate = ?, productPrice = ?, productQuantity = ? , orderNumber = ?, productDescription = ? WHERE id = ?",
    [productName,supplierName,supplierEmail,expirationDate,productPrice,productQuantity,orderNumber,productDescription],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.put("/typeShii/update/:id",(req,res)=>{

  const id = req.params.id;
  const {name,email,password} = req.body;

  db.query(
    "UPDATE type SET name = ? , email = ? , password = ? WHERE id = ? ",
    [name,email,password,id],
    (err,result)=>{
      if(err){
        console.log(err);
      }else{
        res.send(result);
      }
    }
  )
})

app.delete("/typeShii/delete/:id",(req,res)=>{
  const id = req.params.id;
  db.query("DELETE FROM type WHERE id = ?",id,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  })
})


app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM employees WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.delete("/inventory/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM inventory WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.delete("/decision/delete/:id",(req,res)=>{
  const id = req.params.id;
  db.query("DELETE FROM decision WHERE id = ?", id, (err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  })
})

app.listen(3001, () => {
  console.log("Yey, your server is running on port 3001");
});