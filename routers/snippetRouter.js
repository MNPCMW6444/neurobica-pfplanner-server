const router = require("express").Router();
const Snippet = require("../models/snippetModel");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user });
    res.json(snippets);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, parent } = req.body;

    // validation

    if (!title) {
      return res.status(400).json({
        errorMessage: "You need to enter the title.",
      });
    }

    const newSnippet = new Snippet({
      title,
      done: false,
      parent,
      user: req.user,
    });

    const savedSnippet = await newSnippet.save();

    res.json(savedSnippet);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const snippetId = req.params.id;

    // validation

    if (!title) {
      return res.status(400).json({
        errorMessage: "You need to enter the title.",
      });
    }

    if (!snippetId)
      return res.status(400).json({
        errorMessage: "Snippet ID not given. Please contact the developer.",
      });

    const originalSnippet = await Snippet.findById(snippetId);
    if (!originalSnippet)
      return res.status(400).json({
        errorMessage:
          "No snippet with this ID was found. Please contact the developer.",
      });

    if (originalSnippet.user.toString() !== req.user)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    originalSnippet.title = title;

    const savedSnippet = await originalSnippet.save();

    res.json(savedSnippet);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.put("/check/:id", auth, async (req, res) => {
  try {
    const { done } = req.body;
    const snippetId = req.params.id;

    // validation

    if (done === undefined) {
      return res.status(400).json({
        errorMessage: "You need to enter the done.",
      });
    }

    if (!snippetId)
      return res.status(400).json({
        errorMessage: "Snippet ID not given. Please contact the developer.",
      });

    const originalSnippet = await Snippet.findById(snippetId);
    if (!originalSnippet)
      return res.status(400).json({
        errorMessage:
          "No snippet with this ID was found. Please contact the developer.",
      });

    if (originalSnippet.user.toString() !== req.user)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    originalSnippet.done = done;

    const savedSnippet = await originalSnippet.save();

    const allsnippets = await Snippet.find({ user: req.user });

    if (done) {
      allsnippets.forEach(async (snippet) => {
        const originalSnippet = await Snippet.findById(snippet._id);
        console.log(originalSnippet.parent);
        console.log(savedSnippet._id);
        if (originalSnippet.parent === savedSnippet._id) {
          originalSnippet.done = true;
          await originalSnippet.save();
        }
      });
    }

    res.json(savedSnippet);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const snippetId = req.params.id;

    // validation

    if (!snippetId)
      return res.status(400).json({
        errorMessage: "Snippet ID not given. Please contact the developer.",
      });

    const existingSnippet = await Snippet.findById(snippetId);
    if (!existingSnippet)
      return res.status(400).json({
        errorMessage:
          "No snippet with this ID was found. Please contact the developer.",
      });

    if (existingSnippet.user.toString() !== req.user)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    await existingSnippet.delete();

    res.json(existingSnippet);
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

module.exports = router;
