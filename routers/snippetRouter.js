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

async function logicit(req) {
  /*   console.log("CALLLLEED");
   */ const allsnippets = await Snippet.find({ user: req.user });
  for (let i = 0; i < allsnippets.length; i++) {
    if (allsnippets[i].parent) {
      const it = await Snippet.findById(
        JSON.stringify(allsnippets[i]._id)
          .toString()
          .substring(
            1,
            JSON.stringify(allsnippets[i]._id).toString().length - 1
          )
      );
      const parent = await Snippet.findById(
        JSON.stringify(allsnippets[i].parent)
          .toString()
          .substring(
            1,
            JSON.stringify(allsnippets[i].parent).toString().length - 1
          )
      );
      if (parent && parent.done && !it.done) {
        /*         console.log(parent.done);
         */ it.done = parent.done;
        const checkecd = await it.save();
        /*         console.log("CHECKED!!!!   " + checkecd._id);
         */ return false;
      }
    }
  }
  /*   console.log("FINISHED!!!");
   */ return true;
}

async function logicitB(req) {
  /*   console.log("CALLLLEED");
   */ const allsnippets = await Snippet.find({ user: req.user });
  for (let i = 0; i < allsnippets.length; i++) {
    if (allsnippets[i].parent) {
      const it = await Snippet.findById(
        JSON.stringify(allsnippets[i]._id)
          .toString()
          .substring(
            1,
            JSON.stringify(allsnippets[i]._id).toString().length - 1
          )
      );
      const parent = await Snippet.findById(
        JSON.stringify(allsnippets[i].parent)
          .toString()
          .substring(
            1,
            JSON.stringify(allsnippets[i].parent).toString().length - 1
          )
      );
      if (parent && parent.done == false) {
        const brothers = await Snippet.find({ parent: parent._id });
        let isTWET = true;

        for (let i = 0; i < brothers.length; i++) {
          if (brothers[i].done == false) {
            isTWET = false;
          }
        }
        if (isTWET) {
          parent.done = true;
          await parent.save();
          return false;
        }
      }
    }
  }
  /*   console.log("FINISHED!!!");
   */ return true;
}

async function unckeck(savedSnippet) {
  if (savedSnippet.parent) {
    const parent = await Snippet.findById(
      JSON.stringify(savedSnippet.parent)
        .toString()
        .substring(1, JSON.stringify(savedSnippet.parent).toString().length - 1)
    );
    parent.done = false;
    const newsavedSnippet = await parent.save();
    await unckeck(newsavedSnippet);
  }
}

async function unckeckKids(savedSnippet) {
  const kids = await Snippet.find({ parent: savedSnippet._id });
  for (let i = 0; i < kids.length; i++) {
    const kid = await Snippet.findById(
      JSON.stringify(kids[i]._id)
        .toString()
        .substring(1, JSON.stringify(kids[i]._id).toString().length - 1)
    );
    kid.done = false;
    const newkid = await kid.save();
    await unckeckKids(newkid);
  }
}

router.put("/check/:id", auth, async (req, res) => {
  /*   console.log("Started");
   */ try {
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

    if (!done) {
      await unckeck(savedSnippet);
      await unckeckKids(savedSnippet);
    }

    while (!(await logicitB(req)));
    while (!(await logicit(req)));
    /*     console.log("Finished");
     */
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
