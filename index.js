const express = require('express')
require('dotenv').config()
const cors = require('cors')
const connectDB = require('./Cluster/db');
const app = express();
app.use(cors())
app.use(express.json())


const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Listnig to port" + port);
    connectDB();
})

app.use('', require("./Routes/userEP"))
app.use('', require('./Routes/fileEP'))