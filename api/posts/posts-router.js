// implement your posts router here
const express = require("express");
const Posts = require("./posts-model");

const postsRouter = express.Router();

// [x] [GET] /api/posts
postsRouter.get("/", (req, res) => {
  Posts.find()
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "The posts information could not be retrieved",
        err: err.message,
        stack: err.stack,
      });
    });
});

// [x] [GET] /api/posts/:id
postsRouter.get("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    post
      ? res.status(200).json(post)
      : res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The post information could not be retrieved",
      err: err.message,
      stack: err.stack,
    });
  }
});

// [x] [POST] /api/posts
postsRouter.post("/", (req, res) => {
  const { title, contents } = req.body;
  !title || !contents
    ? res
        .status(400)
        .json({ message: "Please provide title and contents for the post" })
    : Posts.insert({ title, contents })
        .then(({ id }) => {
          return Posts.findById(id);
        })
        .then((post) => {
          res.status(201).json(post);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            message: "There was an error while saving the post to the database",
            err: err.message,
            stack: err.stack,
          });
        });
});

// [x] [PUT] /api/posts/:id
postsRouter.put("/:id", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
  } else {
    Posts.findById(req.params.id)
      .then((changes) => {
        if (!changes) {
          res.status(404).json({
            message: "The post with the specified ID does not exist",
          });
        } else {
          return Posts.update(req.params.id, req.body);
        }
      })
      .then((updatedPost) => {
        if (updatedPost) {
          return Posts.findById(req.params.id);
        }
      })
      .then((post) => {
        if (post) {
          res.status(200).json(post);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          message: "The post information could not be modified",
          err: err.message,
          stack: err.stack,
        });
      });
  }
});

// [x] [DELETE] /api/posts/:id
postsRouter.delete("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist" });
    } else {
      await Posts.remove(req.params.id);
      res.json(post);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "The post could not be removed",
      err: err.message,
      stack: err.stack,
    });
  }
});

// [x] [GET] /api/posts/:id/comments
postsRouter.get("/:id/comments", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        message: "The post with the specified ID does not exist",
      });
    } else {
      const messages = await Posts.findPostComments(req.params.id);
      res.json(messages);
    }
  } catch (err) {
    res.status(500).json({
      message: "The comments information could not be retrieved",
      err: err.message,
      stack: err.stack,
    });
  }
});

module.exports = postsRouter;