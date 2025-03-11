const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  portraitImgUrl: {
    type: String,
    required: true,
  },
  landscapeImgUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  genre: {
    type: [String],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  cast: [
    {
      actorName: String,
      role: String,
      imgURL: String,
    },
  ],
  crew: [
    {
      memberName: String,
      role: String,
      imgURL: String,
    },
  ],
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
