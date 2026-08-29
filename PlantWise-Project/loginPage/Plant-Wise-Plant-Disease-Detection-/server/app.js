require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const dns = require("node:dns");
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);
require("./db/conn");
const router = express.Router();
const PORT = 6005;
const session = require("express-session");
const passport = require("passport");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { OpenAI } = require("openai");
const { Groq } = require("groq-sdk");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userSchema");
const Plant = require("./model/plantSchema");
const Post = require("./model/postSchema");

const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
let groq;
try {
  groq = new Groq(process.env.GROQ_API_KEY);
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
} catch (err) {
  console.error("Failed to initialize Groq client:", err.message);
}

// Enhanced CORS configuration
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Session configuration with proper cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    secure: false, // Set to true in production with HTTPS
    httpOnly: true
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
passport.use(
  new OAuth2Strategy({
    clientID: clientid,
    clientSecret: clientsecret,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"]
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userdb.findOne({ googleId: profile.id });

        if (!user) {
          user = new userdb({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
////////////////////////////////////
// const awardBadge = async (user, badgeName) => {
//   const alreadyHasBadge = user.badges?.some(b => b.name === badgeName);
//   if (!alreadyHasBadge) {
//     user.badges.push({ name: badgeName });
//     await user.save();
//     return true; // badge awarded
//   }
//   return false; // already had badge
// };
const awardBadge = async (user, badgeName, plantClassName = "") => {
  const alreadyHasBadge = user.badges.some(b => b.name === badgeName && b.plantClassName === plantClassName);
  if (alreadyHasBadge) return null;

  const newBadge = {
    name: badgeName,
    earnedAt: new Date(),
    plantClassName,
  };

  user.badges.push(newBadge);
  return newBadge;
};


// Passport serialization
passport.serializeUser((user, done) => {
  done(null, {
    id: user._id,
    googleId: user.googleId,
    displayName: user.displayName,
    email: user.email,
    image: user.image
  });
});

passport.deserializeUser(async (user, done) => {
  try {
    const foundUser = await userdb.findById(user.id);
    done(null, foundUser);
  } catch (err) {
    done(err, null);
  }
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============ ALL YOUR PREVIOUS APIs ============

// Plant-related APIs
app.post("/addPlant", async (req, res) => {
  const { class_name, care_routine } = req.body;

  try {
    const newPlant = await Plant.create({
      class_name,
      Care_Routine: care_routine || "Default care routine",
    });

    res.status(201).json({
      message: "Plant added successfully",
      newPlant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding plant", error });
  }
});

// app.post("/save-prediction", isAuthenticated, async (req, res) => {
//     try {
//         const { className } = req.body;

//         // Find the user in the database
//         const user = await userdb.findOne({ googleId: req.user.googleId });

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // Add the prediction with timestamp
//         const prediction = { className, timestamp: new Date() };

//         if (!user.predictions) {
//             user.predictions = [];
//         }

//         user.predictions.push(prediction);

//         // Save the updated user document
//         await user.save();

//         res.status(200).json({ message: "Prediction saved successfully." });
//     } catch (error) {
//         console.error("Error saving prediction:", error);
//         res.status(500).json({ message: "An error occurred while saving the prediction." });
//     }
// });


app.post("/save-prediction", isAuthenticated, async (req, res) => {
  try {
    const { className, morningCareRoutine, nightCareRoutine } = req.body;

    const user = await userdb.findOne({ googleId: req.user.googleId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const prediction = {
      className,
      morningCareRoutine,
      nightCareRoutine,
      timestamp: new Date(),
    };

    user.predictions.push(prediction);
    user.badgeProgress.imageDetections = (user.badgeProgress.imageDetections || 0) + 1;

    let badgeAwarded = null;
    const count = user.badgeProgress.imageDetections;

    if (count === 1) {
      badgeAwarded = await awardBadge(user, "First Detection");
    } else if (count === 5) {
      badgeAwarded = await awardBadge(user, "Detection Master - Level 1");
    } else if (count === 10) {
      badgeAwarded = await awardBadge(user, "Detection Master - Level 2");
    }

    await user.save();

    res.status(200).json({
      message: "Prediction saved successfully.",
      badgeAwarded: badgeAwarded ? `New badge earned: ${badgeAwarded.name}` : null,
      badgeProgress: user.badgeProgress,
      allBadges: user.badges,
    });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ message: "An error occurred while saving the prediction." });
  }
});



router.get("/predictions", isAuthenticated, async (req, res) => {
  try {
    const user = await userdb.findOne({ googleId: req.user.googleId }).lean();
    if (user && user.predictions) {
      return res.status(200).json(user.predictions); // ← Return the full predictions array with morning & night routines
    }
    res.status(404).json({ message: "No predictions found" });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/ai-care-routine", async (req, res) => {
  const { className } = req.body;

  if (!className) {
    return res.status(400).json({ message: "className is required" });
  }

  try {
    // First check if we have this in database
    const existingPlant = await Plant.findOne({ class_name: className });
    if (existingPlant && existingPlant.morningCareRoutine && existingPlant.nightCareRoutine) {
      return res.status(200).json({
        morning: existingPlant.morningCareRoutine,
        night: existingPlant.nightCareRoutine,
        source: "database"
      });
    }

    // If not in database, generate with AI
    const prompt = `Provide a detailed care routine for a plant with disease "${className}". 
    Format the response as a JSON object with two arrays: "morning" and "night". 
    Each array should contain 3-5 bullet point steps for caring for this plant. 
    Focus specifically on treating the disease mentioned. 
    Use simple language and practical steps.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable botanist specializing in plant diseases and care routines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    let careRoutine;

    try {
      careRoutine = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return res.status(500).json({ message: "Error parsing AI response" });
    }

    // Save to database for future use
    await Plant.findOneAndUpdate(
      { class_name: className },
      {
        class_name: className,
        morningCareRoutine: careRoutine.morning,
        nightCareRoutine: careRoutine.night
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      ...careRoutine,
      source: "ai"
    });
  } catch (error) {
    console.error("Error generating care routine:", error);
    res.status(500).json({ message: "Error generating care routine", error: error.message });
  }
});

app.post("/generate-care-routine", async (req, res) => {
  console.log("Groq API Key:", process.env.GROQ_API_KEY ? "Loaded successfully" : "MISSING!");
  console.log("Generating care routine for:", req.body.diseaseName);

  // Input validation
  const { diseaseName } = req.body;
  if (!diseaseName) {
    return res.status(400).json({
      error: "diseaseName is required",
      receivedBody: req.body
    });
  }

  // Verify Groq client
  if (!groq) {
    return res.status(500).json({
      error: "Groq client not initialized",
      apiKeyStatus: process.env.GROQ_API_KEY ? "exists" : "missing"
    });
  }

  try {
    const prompt = `As a professional botanist, generate a detailed plant care routine for treating ${diseaseName}. 
    Provide separate morning and night routines as arrays of strings. Each routine should have 
    5-7 specific steps. Format the response as JSON with these EXACT properties:
    {
      "morningCareRoutine": ["step 1", "step 2"],
      "nightCareRoutine": ["step 1", "step 2"]
    }`;

    console.log("Using model: llama3-70b-8192");
    const startTime = Date.now();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a botanist specializing in plant disease treatment. Return valid JSON with only morningCareRoutine and nightCareRoutine arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192", // Updated model
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const duration = Date.now() - startTime;
    console.log(`Groq response received in ${duration}ms`);

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error("Invalid response structure from Groq");
    }

    const content = completion.choices[0].message.content;
    console.log("Raw response content:", content);

    let careRoutine;
    try {
      careRoutine = JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e.message}`);
    }

    // Validate and normalize response
    const validatedRoutine = {
      morningCareRoutine: Array.isArray(careRoutine.morningCareRoutine)
        ? careRoutine.morningCareRoutine.map(String)
        : [String(careRoutine.morningCareRoutine || "Morning routine not provided")],
      nightCareRoutine: Array.isArray(careRoutine.nightCareRoutine)
        ? careRoutine.nightCareRoutine.map(String)
        : [String(careRoutine.nightCareRoutine || "Night routine not provided")],
      generatedAt: new Date().toISOString(),
      modelUsed: "llama3-70b-8192"
    };

    return res.status(200).json(validatedRoutine);

  } catch (error) {
    console.error("Error generating routine:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Comprehensive fallback
    const diseaseSpecificTips = getDiseaseFallbackTips(diseaseName);

    return res.status(500).json({
      error: "Failed to generate custom routine",
      details: error.message,
      fallbackRoutine: diseaseSpecificTips,
      usedFallback: true,
      suggestion: "Try again or contact support",
      documentation: "https://console.groq.com/docs"
    });
  }
});

// Helper function for disease-specific fallback tips
function getDiseaseFallbackTips(diseaseName) {
  const commonTips = {
    morningCareRoutine: [
      "1. Inspect plant for disease progression",
      "2. Water at the base (avoid wetting leaves)",
      "3. Apply recommended fungicide/pesticide",
      "4. Prune affected areas with sterilized tools",
      "5. Ensure proper sunlight exposure"
    ],
    nightCareRoutine: [
      "1. Check for nocturnal pests",
      "2. Mist leaves if humidity is needed",
      "3. Move to well-ventilated area",
      "4. Monitor soil moisture",
      "5. Record plant health observations"
    ]
  };

  // Disease-specific overrides
  const diseaseTips = {
    "Potato___Early_blight": {
      morningCareRoutine: [
        ...commonTips.morningCareRoutine,
        "6. Apply copper-based fungicide",
        "7. Remove lower leaves touching soil"
      ],
      nightCareRoutine: [
        ...commonTips.nightCareRoutine,
        "6. Clear plant debris around base"
      ]
    },
    "Tomato___Late_blight": {
      morningCareRoutine: [
        ...commonTips.morningCareRoutine,
        "6. Apply chlorothalonil-based fungicide",
        "7. Stake plants for better air flow"
      ]
    }
  };

  return diseaseTips[diseaseName] || commonTips;
}

app.get("/care-routine/:class_name", async (req, res) => {
  const { class_name } = req.params;

  try {
    const plant = await Plant.findOne({ class_name });
    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }
    res.status(200).json({
      morningCareRoutine: plant.morningCareRoutine,
      nightCareRoutine: plant.nightCareRoutine
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching care routine", error });
  }
});


app.put("/addCareRoutineToAll", async (req, res) => {
  const { care_routine } = req.body;

  try {
    const result = await Plant.updateMany(
      {},
      { $set: { Care_Routine: care_routine || "Default care routine" } },
      { upsert: false }
    );

    res.status(200).json({
      message: "Care routines updated for all documents",
      updatedCount: result.nModified,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating care routines", error });
  }
});

// app.put("/updateCareRoutine", async (req, res) => {
//     const { class_name, care_routine } = req.body;

//     if (!class_name || !care_routine) {
//         return res.status(400).json({ message: "class_name and care_routine are required" });
//     }

//     try {
//         const updatedPlant = await Plant.findOneAndUpdate(
//             { class_name: new RegExp(`^${class_name}$`, 'i') },
//             { $set: { Care_Routine: care_routine } },
//             { new: true, upsert: false, runValidators: true }
//         );

//         if (!updatedPlant) {
//             return res.status(404).json({ message: "No plant found with the specified class_name" });
//         }

//         res.status(200).json({
//             message: "Care routine updated successfully",
//             updatedPlant,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error updating care routine", error });
//     }
// });

// ============ SOCIAL MEDIA APIs ============
app.put("/updateCareRoutine", async (req, res) => {
  const { class_name, morningCareRoutine, nightCareRoutine } = req.body;

  if (!class_name || (!morningCareRoutine && !nightCareRoutine)) {
    return res.status(400).json({ message: "class_name, morningCareRoutine, and nightCareRoutine are required" });
  }

  try {
    const updatedPlant = await Plant.findOneAndUpdate(
      { class_name: new RegExp(`^${class_name}$`, 'i') },
      {
        $set: {
          ...(morningCareRoutine && { morningCareRoutine }),
          ...(nightCareRoutine && { nightCareRoutine })
        },
        $unset: { Care_Routine: "" } // Removes Care_Routine field if it exists
      },
      { new: true, upsert: false, runValidators: true }
    );

    if (!updatedPlant) {
      return res.status(404).json({ message: "No plant found with the specified class_name" });
    }

    res.status(200).json({
      message: "Care routine updated successfully",
      updatedPlant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating care routine", error });
  }
});


app.get("/api/posts", isAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const posts = await Post.find({ user: req.user._id })
      .populate("user", "displayName image")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error); // Add this line
    res.status(500).json({ message: "Error fetching posts" });
  }
});



app.post("/api/posts/:postId/comments", isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: userId,
      text
    });

    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate("user", "displayName image")
      .populate("comments.user", "displayName image");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

// app.get("/api/posts", isAuthenticated, async (req, res) => {
//     try {
//         const posts = await Post.find()
//             .populate("user", "displayName image")
//             .sort({ createdAt: -1 });
//         res.status(200).json(posts);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching posts" });
//     }
// });

app.post("/api/posts/:postId/like", isAuthenticated, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating like" });
  }
});

app.delete("/api/posts/:postId", isAuthenticated, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findOneAndDelete({ _id: postId, user: userId });
    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// ============ AUTH ROUTES ============

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "http://localhost:3000/dashboard",
  failureRedirect: "http://localhost:3000/login"
}));

app.get("/login/sucess", async (req, res) => {
  if (req.user) {
    res.status(200).json({
      message: "Login successful",
      user: {
        displayName: req.user.displayName,
        email: req.user.email,
        image: req.user.image,
        googleId: req.user.googleId,
        badges: req.user.badges,
        badgeProgress: req.user.badgeProgress,
        predictions: req.user.predictions
      }
    });
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
});


app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect("http://localhost:3000");
  });
});
////////////////////////////////////////

// app.post("/save-prediction", isAuthenticated, async (req, res) => {
//   try {
//     const { className } = req.body;
//     const user = await userdb.findOne({ googleId: req.user.googleId });

//     if (!user) return res.status(404).json({ message: "User not found." });

//     user.predictions.push({ className, timestamp: new Date() });
//     user.badgeProgress.imageDetections += 1;

//     // Example: Award badge after 1st or 10th image detection
//     if (user.badgeProgress.imageDetections === 1) {
//       await awardBadge(user, "First Detection");
//     } else if (user.badgeProgress.imageDetections === 10) {
//       await awardBadge(user, "Image Master");
//     }

//     await user.save();
//     res.status(200).json({ message: "Prediction saved and badge checked." });
//   } catch (error) {
//     console.error("Error saving prediction:", error);
//     res.status(500).json({ message: "An error occurred." });
//   }
// });

app.get("/api/user/badges", isAuthenticated, async (req, res) => {
  try {
    const user = await userdb.findOne({ googleId: req.user.googleId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const total = user.predictions.length;
    const completed = user.predictions.filter(p => p.badgeEarned).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({
      progress,
      badges: user.badges || [],
    });
  } catch (error) {
    console.error("Error fetching badge progress:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/markCareRoutineComplete", async (req, res) => {
  const { userId, plantId, routineType, date } = req.body;

  if (!userId || !plantId || !routineType || !date) {
    return res.status(400).json({ message: "Missing fields: userId, plantId, routineType, date" });
  }

  try {
    const existing = await CareProgress.findOne({ userId, plantId, routineType, date });

    if (existing && existing.completed) {
      return res.status(400).json({ message: `${routineType} routine already completed for this plant` });
    }

    const updated = await CareProgress.findOneAndUpdate(
      { userId, plantId, routineType, date },
      { $set: { completed: true } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Routine marked as complete", progress: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking care routine complete", error: err });
  }
});

app.get("/getRoutineProgress", async (req, res) => {
  const { userId, plantId, date } = req.query;

  try {
    const progress = await CareProgress.find({ userId, plantId, date });

    res.status(200).json({ progress }); // contains morning/night routineType + completed flag
  } catch (err) {
    res.status(500).json({ message: "Error fetching progress", error: err });
  }
});


app.post("/api/user/mark-care", isAuthenticated, async (req, res) => {
  const { className, routineType } = req.body;

  try {
    const user = await userdb.findOne({ googleId: req.user.googleId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const prediction = user.predictions.find(p => p.className === className);
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });

    const completionField = `completed${routineType.charAt(0).toUpperCase() + routineType.slice(1)}`;
    if (prediction[completionField]) {
      return res.status(200).json({ message: `${routineType} routine already completed` });
    }

    // Mark routine as completed
    prediction[completionField] = true;

    let badgeAwarded = null;
    let badgeEarned = false;

    // Initialize badgeProgress object if not present
    user.badgeProgress = user.badgeProgress || {};
    user.badgeProgress[`${className}_careProgress`] = user.badgeProgress[`${className}_careProgress`] || 0;

    // Each routine adds 10%
    user.badgeProgress[`${className}_careProgress`] += 10;

    // Cap the progress at 100 just in case
    if (user.badgeProgress[`${className}_careProgress`] > 100) {
      user.badgeProgress[`${className}_careProgress`] = 100;
    }

    // Award badge if both routines are done and not yet awarded
    if (prediction.completedMorning && prediction.completedNight && !prediction.badgeEarned) {
      prediction.badgeEarned = true;
      badgeEarned = true;
      badgeAwarded = await awardBadge(user, `${className} Care Master`, className);
    }

    await user.save();

    res.status(200).json({
      message: `${routineType} routine marked as complete`,
      badgeAwarded,
      badgeEarned,
      completedMorning: prediction.completedMorning,
      completedNight: prediction.completedNight,
      careProgress: user.badgeProgress[`${className}_careProgress`]
    });
  } catch (error) {
    console.error("Error marking care routine:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Add this to your API routes
app.get("/api/user/plant-progress", isAuthenticated, async (req, res) => {
  try {
    const user = await userdb.findOne({ googleId: req.user.googleId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const plantProgress = user.predictions.map(prediction => ({
      className: prediction.className,
      progress: {
        morning: prediction.completedMorning,
        night: prediction.completedNight,
        badgeEarned: prediction.badgeEarned
      },
      timestamp: prediction.timestamp
    }));

    res.status(200).json(plantProgress);
  } catch (error) {
    console.error("Error fetching plant progress:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/api/user/badges", isAuthenticated, async (req, res) => {
  try {
    const user = await userdb.findOne({ googleId: req.user.googleId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const total = user.predictions.length;
    const completed = user.predictions.filter(p => p.badgeEarned).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({
      progress,
      badges: user.badges || [],
    });
  } catch (error) {
    console.error("Error fetching badge progress:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

////////////////////////////////////////

// ============ CRON JOB ============

// Uncomment to enable email notifications
// cron.schedule("* * * * *", async () => {
//   try {
//     const currentDate = new Date();
//     console.log(`Running daily notifications at ${currentDate}`);

//     const users = await userdb.find({
//       'notifications.frequency': { $ne: 'none' },
//       $or: [
//         { 'notifications.lastSent': { $exists: false } },
//         { 'notifications.lastSent': { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
//       ]
//     }).lean();

//     for (const user of users) {
//       try {
//         const activePlants = user.predictions.filter(p => 
//           !p.badgeEarned && 
//           (p.morningCareRoutine && !p.completedMorning) || 
//           (p.nightCareRoutine && !p.completedNight)
//         );

//         if (activePlants.length > 0) {
//           await transporter.sendMail({
//             from: `PlantCare <${process.env.EMAIL_USER}>`,
//             to: user.email,
//             subject: `🌿 Care for ${activePlants.length} plant${activePlants.length > 1 ? 's' : ''}`,
//             html: generateEmailHtml(user, activePlants),
//             text: generateEmailText(activePlants)
//           });

//           await userdb.updateOne(
//             { _id: user._id },
//             { $set: { 'notifications.lastSent': currentDate } }
//           );

//           console.log(`Notification sent to ${user.email}`);
//         }
//       } catch (userError) {
//         console.error(`Error processing user ${user.email}:`, userError);
//       }
//     }

//     console.log(`Notifications completed. Sent to ${users.length} users.`);
//   } catch (error) {
//     console.error("Error in notification cron job:", error);
//   }
// });

// Helper functions
function generateEmailHtml(user, plants) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🌿 Your Plant Care Reminder</h2>
      <p>Hello ${user.displayName}, here are your plants needing attention today:</p>
      
      ${plants.map(p => `
        <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #388E3C;">${p.className}</h3>
          ${p.morningCareRoutine && !p.completedMorning ? `
            <div style="margin-bottom: 10px;">
              <strong>☀️ Morning Routine:</strong>
              <ul style="margin-top: 5px; padding-left: 20px;">
                ${p.morningCareRoutine.map(task => `<li>${task}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${p.nightCareRoutine && !p.completedNight ? `
            <div style="margin-bottom: 10px;">
              <strong>🌙 Evening Routine:</strong>
              <ul style="margin-top: 5px; padding-left: 20px;">
                ${p.nightCareRoutine.map(task => `<li>${task}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${getProgressMessage(p)}
        </div>
      `).join('')}
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="http://localhost:3000/saved-plants" 
           style="background: #4CAF50; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; font-weight: bold;">
          View Your Plants
        </a>
      </div>
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        <a href="http://yourwebsite.com/settings/notifications">Change notification preferences</a>
      </p>
    </div>
  `;
}

function getProgressMessage(plant) {
  if (plant.completedMorning && !plant.completedNight) {
    return `<p style="color: #FFA000; font-weight: bold;">
      ⭐ Complete your evening routine to earn a badge!
    </p>`;
  }
  if (!plant.completedMorning && plant.completedNight) {
    return `<p style="color: #FFA000;">
      🌞 Don't forget your morning routine!
    </p>`;
  }
  return '';
}

function generateEmailText(plants) {
  return plants.map(p => {
    let message = `🌱 ${p.className}:\n`;
    if (p.morningCareRoutine && !p.completedMorning) {
      message += `☀️ Morning: ${p.morningCareRoutine.join(', ')}\n`;
    }
    if (p.nightCareRoutine && !p.completedNight) {
      message += `🌙 Evening: ${p.nightCareRoutine.join(', ')}\n`;
    }
    if (p.completedMorning && !p.completedNight) {
      message += `⭐ Complete evening routine to earn a badge!\n`;
    }
    return message;
  }).join('\n\n');
}

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});