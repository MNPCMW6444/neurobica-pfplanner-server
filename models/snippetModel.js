const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const snippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    done: { type: Boolean, required: true },
    parent: { type: ObjectId },
    user: { type: ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

const Snippet = mongoose.model("snippet", snippetSchema);

module.exports = Snippet;
