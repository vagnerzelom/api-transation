require('dotenv').config();

const cors = require("cors");
const express = require('express');
const {uuid,isUuid} = require('uuidv4');


const app = express();

app.use(cors());
app.use(express.json());

const store = {
  transactions:[],
  balance:{}
};


function outcomeSum(request, response, next){
  const {value,type}= request.body;
  store.balance.income=0;
  store.balance.outcome=0;
  store.balance.total=0;
  for (const transaction of store.transactions) {
    if(transaction.type ==='income'){
      store.balance.income+=transaction.value;
    }
    if(transaction.type ==='outcome'){
      store.balance.outcome+=transaction.value;
    }
  }
  store.balance.total=store.balance.outcome-store.balance.income;
  next();
}

function validateTransactionId(request, response, next) {
    const{id}=request.params;
    if(!isUuid(id)){
      return response.status(400).json({error:"param sent is not a valid UUID"});
    };
    next();
  }

function logRequest(resquest, response, next) {
    const{url}= resquest;

    const logLabel=`${url}`;

    console.log(logLabel);
    return next()
}

app.use(logRequest);

app.use('/transactions/:id',validateTransactionId);

app.get("/transactions",outcomeSum, (request, response) => {
    
    return response.json(store);
});

app.post("/transactions", (request,response) => {
    const {title,value,type} = request.body;
   
    const transaction = { id:uuid(), title, value, type};

    store.transactions.push(transaction);

    return response.json(transaction);
});

app.put('/transactions/:id', (request, response) => {
    const {id} = request.params;
    const {title, value, type} = request.body;

    const transIndex = store.transactions.findIndex((trans) => trans.id == id);
    
    const transaction = {
        id, title, value, type
    };
    
    store.transactions[transIndex] = transaction

    return response.json(transaction)
})

app.delete("/transactions/:id", (request, response) => {
    const { id } = request.params;
  
    const tranIndex = store.transactions.findIndex((trans) => trans.id == id);
  
    store.transactions.splice(tranIndex, 1);
  
    return response.status(204).send();
  });

const port = process.env.PORT || 3333;

app.listen(port, ()=> {
    console.log(`Server up and running on port ${port}`);
});




//"transactions": [
//{
  //  "id": "uuid",
  //  "title": "Salário",
  //  "value": 4000,
  //  "type": "income"
    // },

   