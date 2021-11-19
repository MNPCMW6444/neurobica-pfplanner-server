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
    console.log(snippetId);
    console.log(title);

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

    let savedSnippet = await originalSnippet.save();

    const allsnippets = await Snippet.find({ user: req.user });

    const checkrec = async (snippet, log) => {
      if (snippet) {
        const originalSnippet2 = await Snippet.findById(snippet._id);
        if (originalSnippet2) {
          if (log) {
            console.log(JSON.stringify(savedSnippet._id));
            console.log(JSON.stringify(originalSnippet2.parent));
            console.log("  ");
          }
          if (
            JSON.stringify(savedSnippet._id) ===
            JSON.stringify(originalSnippet2.parent)
          ) {
            console.log("CHKCHKCHK");
            originalSnippet2.done = true;
            savedSnippet = await originalSnippet2.save();
          } else if (originalSnippet2 && originalSnippet2.parent) {
            const id = JSON.stringify(originalSnippet2.parent);
            const pd = '"6197d73f8c55270844fb0a01"';
            const log = id === pd ? true : false;
            /*  console.log("id IS " + id);
            console.log("pd IS " + pd);
            console.log("log IS " + log);
            console.log(); */
            checkrec(await Snippet.findById(originalSnippet2.parent), log);
          }
        }
      }
    };

    if (done) {
      for (let i = 0; i < allsnippets.length; i++)
        checkrec(allsnippets[i], false);
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
