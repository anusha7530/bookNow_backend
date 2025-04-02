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
      duration,
    } = req.body;

    const newMovie = new Movie({
      title,
      description,
      portraitImgUrl,
      landscapeImgUrl,
      rating,
      genre,
      duration,
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
    const { movieId, celebType, celebName, celebRole, celebImage } = req.body;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        ok: false,
        message: "Movie not found",
      });
    }
    const newCeleb = {
      celebType,
      celebName,
      celebRole,
      celebImage,
    };
    if (celebType === "cast") {
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
        notAvailableSeats: [],
        showDate,
      });
      await screen.save();
      res.status(201).json({
        ok: true,
        message: "Movies added successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/bookticket", authTokenHandler, async (req, res, next) => {
  try {
    const {
      showTime,
      showDate,
      movieId,
      screenId,
      seats,
      totalPrice,
      paymentId,
      paymentType,
    } = req.body;

    //payment id verification(future)

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({
        ok: false,
        message: "Screen not found",
      });
    }
    const movieSchedule = screen.movieSchedules.find(
      (schedule) =>
        schedule.movieId === movieId &&
        schedule.showTime === showTime &&
        schedule.showDate === showDate
    );

    if (!movieSchedule) {
      return res.status(404).json({
        ok: false,
        message: "Movie schedule not found",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const newBooking = new Booking({
      userId: req.userId,
      showTime,
      showDate,
      movieId,
      screenId,
      seats,
      totalPrice,
      paymentId,
      paymentType,
    });
    await newBooking.save();

    const seatIds = seats.map((seat) => seat.seatId);

    movieSchedule.notAvailableSeats.push(...seatIds);
    await screen.save();

    user.bookings.push(newBooking._id);
    await user.save();
    res.status(201).json({
      ok: true,
      message: "Booking successfully",
    });
  } catch (err) {
    next(err);
  }
});
router.get("/movies", async (req, res, next) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({
      ok: true,
      data: movies,
      message: "Movies retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
});
router.get("/movies/:id", async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        ok: false,
        message: "Movie not found",
      });
    }
    res.status(200).json({
      ok: true,
      data: movie,
      message: "Movie  retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
});
router.get("/screensbycity", async (req, res, next) => {
  try {
    const city = req.body.city;
    const screens = await Screen.find({ city });
    if (!screens || screens.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No screens found in the specific city",
      });
    }
    res.status(200).json({
      ok: true,
      data: screens,
      message: "Screens retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;
