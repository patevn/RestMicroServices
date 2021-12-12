const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-Parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id]) || [];
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ id: commentId, content });
  commentsByPostId[req.params.id] = comments;
  try {
    await axios.post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: { id: commentId, content, postId: req.params.id },
    });
  } catch (e) {
    console.log(`CommentCreated EVENT: ${e}`);
  }
  res.status(201).send(comments);
});

app.post("/events", (req, res) => {
  console.log("Comments Received Event", req.body.type);

  res.send({});
});

app.listen(4001, () => {
  console.log("App up on port 4001");
});
