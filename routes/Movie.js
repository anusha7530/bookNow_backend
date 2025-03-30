const express = require("express");
const router = express.Router();

const User = require("../models/UserSchema");
const Movie = require("../models/MovieSchema");
const Booking = require("../models/BookingSchema");
const Screen = require("../models/ScreenSchema");
const errorHandler = require("../middlewares/errorMiddleware");
const authTokenHandler = require("../middlewares/checkAuthToken");
const adminTokenHandler = require("../middlewares/checkAdminToken");

router.get("/test", async (req, res) => {
  res.json({
    message: "Movie api is working",
  });
});

function createResponse(ok, message, data) {
  return {
    ok,
    message,
    data,
  };
}

router.post("/createmovie", adminTokenHandler, async (req, res, next) => {
  try {
    const {
      title,
      description,
      portraitImgUrl,
      landscapeImgUrl,
      rating,
      genre,
      durattion,
    } = req.body();

    const newMovie = new Movie({
      title,
      description,
      portraitImgUrl,
      landscapeImgUrl,
      rating,
      genre,
      durattion,
    });
    await newMovie.save();
    res.status(201).json({
      ok: true,
      message: "Movie added successfully",
    });
  } catch (err) {
    next(err);
  }
});
router.post("/addcelebtomovie", adminTokenHandler, async (req, res, next) => {
  try {
    const { movieId, celebtype, celebname, celebrole, celebimage } = req.body;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        ok: false,
        message: "Movie not found",
      });
    }
    const newCeleb = {
      celebtype,
      celebname,
      celebrole,
      celebimage,
    };
    if (celebtype === "cast") {
      movie.cast.push(newCeleb);
    } else {
      movie.crew.push(newCeleb);
    }
    await movie.save();
    res.status(201).json({
      ok: true,
      message: "Celeb added successfully",
    });
  } catch (err) {
    next(err);
  }
});
router.post("/createscreen", adminTokenHandler, async (req, res, next) => {
  try {
    const { name, location, seats, city, screenType } = req.body;
    const newScreen = new Screen({
      name,
      location,
      seats,
      city,
      screenType,
      movieSchedules: [],
    });
    await newScreen.save();
    res.status(201).json({
      ok: true,
      message: "Screen added successfully",
    });
  } catch (err) {
    next(err);
  }
});
router.post(
  "/addmoviescheduletoscreen",
  adminTokenHandler,
  async (req, res, next) => {
    try {
      const { screenId, movieId, showTime, showDate } = req.body;
      const screen = await Screen.findById(screenId);
      if (!screen) {
        return res.status(404).json({
          ok: false,
          message: "Screen not found",
        });
      }
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({
          ok: false,
          message: "Movie not found",
        });
      }
      screen.movieSchedules.push({
        movieId,
        showTime,
        notavailableseats:[],
        showDate
      })
    } catch (err) {
      next(err);
    }
  }
);

router.post("/bookticket", authTokenHandler, async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
router.get("/movies", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
router.get("/movies/:id", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
router.get("/screensbycity", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;
