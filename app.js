const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello world!');
});

const port = 3001;

app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});
