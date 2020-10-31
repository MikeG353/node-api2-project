const express = require('express');
const server = express();

// router here

server.use(express.json())

server.get('/', (req, res) => {
    res.send(`
        <h2>Posts API</h2>
        <h3>By: Michael Gregory</h3>
    `)
})
module.exports = server