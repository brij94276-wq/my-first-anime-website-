const express = require('express');
const path = require('path');

const app = express();
const root = path.join(__dirname);

app.use(express.static(root));

app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
