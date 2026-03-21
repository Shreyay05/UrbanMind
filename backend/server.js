const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes); // Prefixes all routes with /api

app.listen(PORT, () => {
    console.log(` SCIA Backend running on http://localhost:${PORT}`);
});