const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3002;

app.use(express.json());

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Middleware to set the current path
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

// Serve the React app (index.html) for any route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
