const express = require('express');
const server = express();
const postsRouter = require('./posts/posts-router.js')

server.use(express.json())
server.use('/api/posts', postsRouter)

server.get('/', (req, res) => {
    res.send(`
        <h2>Posts API</h2>
        <h3>By: Michael Gregory</h3>
    `)
})
module.exports = server