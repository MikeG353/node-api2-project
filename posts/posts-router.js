const { json } = require('express')
const express = require('express')
const router = express.Router()

const posts = require('../data/db.js')

// | Method | Endpoint                | Description                                                                                                                                                                 |
// | ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
// | POST   | /api/posts              | Creates a post using the information sent inside the `request body`.                                                                                                        |
// | POST   | /api/posts/:id/comments | Creates a comment for the post with the specified id using information sent inside of the `request body`.                                                                   |
// | GET    | /api/posts              | Returns an array of all the post objects contained in the database.                                                                                                         |
// | GET    | /api/posts/:id          | Returns the post object with the specified id.                                                                                                                              |
// | GET    | /api/posts/:id/comments | Returns an array of all the comment objects associated with the post with the specified id.                                                                                 |
// | DELETE | /api/posts/:id          | Removes the post with the specified id and returns the **deleted post object**. You may need to make additional calls to the database in order to satisfy this requirement. |
// | PUT    | /api/posts/:id          | Updates the post with the specified `id` using data from the `request body`. Returns the modified document, **NOT the original**.                                           |

// | GET    | /api/posts              | Returns an array of all the post objects contained in the database.                                                                                                         |
router.get('/', (req, res) => {
    posts.find(req.query)
    .then(posts => {
        res.status(200).json(posts)
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({
            error: "The posts information could not be retrieved."
        })
    })
})

// | GET    | /api/posts/:id          | Returns the post object with the specified id.                                                                                                                              |
router.get('/:id', (req, res) => {
    posts.findById(req.params.id)
    .then(post => {
        if (post.length > 0) {
            res.status(200).json(post)
        } else {
            res.status(404).json({
                message: "The post with the specified ID does not exist."
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: "The post information could not be retrieved."
        })
    })
})

// | GET    | /api/posts/:id/comments | Returns an array of all the comment objects associated with the post with the specified id.                                                                                 |
router.get('/:id/comments', async (req, res) => {
    const targetPost = posts.findById(req.params.id)
    if (targetPost) {
        try {
            const comments = await posts.findPostComments(req.params.id)
    
            if (comments.length > 0) {
                res.status(200).json(comments)
            } else {
                res.status(404).json({
                    message: "The post with the specified ID does not have any comments."
                })
            }
        }
        catch (error) {
            console.log(error)
            res.status(500).json({
                error: "The comments information could not be retrieved."
            })
        }
    } else {
        res.status(404).json({
            message: "The post with the specified ID does not exist."
        })
    }
    

})

// | POST   | /api/posts              | Creates a post using the information sent inside the `request body`.                                                                                                        |

router.post('/', (req, res) => {
    if (req.body.title && req.body.contents) {
        posts.insert(req.body)
        .then(post => {
            res.status(201).json(post)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({
                error: "There was an error while saving the post to the database"
            })
        })
    } else {
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
        })
    }    
})

// | POST   | /api/posts/:id/comments | Creates a comment for the post with the specified id using information sent inside of the `request body`.                                                                   |
router.post('/:id/comments', async (req, res) => {
    const targetPost = posts.findById(req.params.id)
    const commentInfo = { ...req.body, post_id: req.params.id }
    
    if (targetPost) {
        if (commentInfo.text) {
            try {
                const comment = await posts.insertComment(commentInfo)
                res.status(201).json(comment)
            }
            catch (err) {
                console.log(err)
                res.status(500).json({ 
                    error: "There was an error while saving the comment to the database" 
                })
            }
        } else {
            res.status(400).json({
                errorMessage: "Please provide text for the comment."
            })
        }        
    } else {
        res.status(404).json({
            message: "The post with the specified ID does not exist."
        })
    }

   
})

// | PUT    | /api/posts/:id          | Updates the post with the specified `id` using data from the `request body`. Returns the modified document, **NOT the original**.                                           |
router.put('/:id', (req, res) => {
    const targetPost = posts.findById(req.params.id)
    const changes = req.body

    if (targetPost) {
        if (changes.title && changes.contents) {
            try {
                posts.update(req.params.id, changes)
                .then(post => {
                    res.status(200).json(post)
                })
                .catch(error => {
                    res.status(400).json({
                        errorMessage: "Please provide title and contents for the post."
                    })
                })
            }
            catch {
                res.status(500).json({
                    error: "The post information could not be modified."
                })
            }
        }
    } else {
        res.status(404).json({
            message: "The post with the specified ID does not exist."
        })
    }   
})

// | DELETE | /api/posts/:id          | Removes the post with the specified id and returns the **deleted post object**. You may need to make additional calls to the database in order to satisfy this requirement. |
router.delete('/:id', (req, res) => {
    const targetPost = posts.findById(req.params.id)
    if (targetPost) {
        try {
            posts.remove(req.params.id)
            .then(count => {
                if (count > 0) {
                    res.status(200).json({ message: "post deleted" })
                } else {
                    res.status(404).json({ message: "The post with the specified ID does not exist." })
                }
            })
            .catch(error => {
                console.log(error)
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            })
        }
        catch {
            res.status(500).json({
                error: "The post could not be removed"
            })
        }
    } else {
        res.status(404).json({
            message: "The post with the specified ID does not exist."
        })
    }
    
})

module.exports = router