require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const https = require("https");
const dns = require("node:dns");
dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);
require("./db/conn");
const router = express.Router();
const PORT = process.env.PORT || 6005;
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
const { isAuthenticated, optionalAuth } = require("./middleware/authMiddleware");
const { signToken } = require("./utils/jwt");
const { publicProfile } = require("./utils/serializeUser");

const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;

// Google's current OAuth 2.0 endpoints. `passport-google-oauth2` is unmaintained
// and defaults the code-for-token exchange to the legacy
// https://www.googleapis.com/oauth2/v4/token host, so both URLs are pinned here
// instead of relying on the package's built-in defaults.
const GOOGLE_AUTH_URL = process.env.GOOGLE_AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";
// Google's OpenID Connect profile endpoint. The npm package hardcodes the same
// lookup on www.googleapis.com, which is reset on some networks/firewalls, so
// the URL is ours to choose (see googleStrategy.userProfile below).
const GOOGLE_USERINFO_URL = process.env.GOOGLE_USERINFO_URL || "https://openidconnect.googleapis.com/v1/userinfo";

// Must be ABSOLUTE and match a redirect URI listed in Google Cloud Console
// character for character. A relative callbackURL is rebuilt from the Host
// header, so opening the API through 127.0.0.1, localhost or a tunnel silently
// changes it and Google rejects the exchange.
const PUBLIC_API_URL = (process.env.PUBLIC_API_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${PUBLIC_API_URL}/auth/google/callback`;

// Where the CRA dev server is reachable (npm start runs it with HTTPS=true).
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS ||
  "http://localhost:3000,https://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || CLIENT_ORIGINS[0] || "http://localhost:3000";

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

// Enhanced CORS configuration - must let the Authorization header through so
// bearer tokens reach the JWT middleware.
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (curl, Postman, server-to-server) with no origin.
    if (!origin) return callback(null, true);
    if (CLIENT_ORIGINS.includes(origin) || CLIENT_ORIGIN === origin) {
      return callback(null, true);
    }
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
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
if (!clientid || !clientsecret) {
  console.warn("[google-oauth] CLIENT_ID / CLIENT_SECRET are not set - Google Sign-In will answer 503 until server/.env provides them.");
}

/**
 * passport reports every token-exchange problem as "Failed to obtain access
 * token". The real cause lives in err.oauthError: an Error for socket/TLS
 * failures, or { statusCode, data } when Google answered with HTTP 4xx.
 */
const describeOAuthError = (err) => {
  const cause = (err && err.oauthError) || err;
  if (!cause) return "unknown error";

  if (cause.statusCode) {
    const data = typeof cause.data === "string" ? cause.data.slice(0, 300) : JSON.stringify(cause.data);
    return `HTTP ${cause.statusCode} ${data}`;
  }
  if (cause instanceof Error || cause.message) {
    const where = cause.syscall ? ` (${cause.syscall}${cause.address ? ` ${cause.address}:${cause.port}` : ""})` : "";
    return `${cause.code || cause.name || "Error"}: ${cause.message}${where}`;
  }
  return String(cause);
};

const googleStrategy = new OAuth2Strategy(
  {
    clientID: clientid,
    clientSecret: clientsecret,
    authorizationURL: GOOGLE_AUTH_URL,
    tokenURL: GOOGLE_TOKEN_URL,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ["profile", "email"]
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Restricted scopes can omit emails/photos, so never index [0] blindly.
        const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || profile.email || "";
        const image = (profile.photos && profile.photos[0] && profile.photos[0].value) || profile.picture || "";

        let user = await userdb.findOne({ googleId: profile.id });

        if (!user && email) {
          // Adopt a legacy record that has this address but no password and no
          // Google link, so the farmer keeps one account instead of two.
          user = await userdb.findOne({ email, googleId: { $exists: false }, password: { $exists: false } });
          if (user) {
            user.googleId = profile.id;
            user.provider = "google";
            console.log(`[google-oauth] linked Google identity to existing account ${user._id}`);
          }
        }

        if (!user) {
          user = new userdb({
            googleId: profile.id,
            displayName: profile.displayName,
            email,
            image,
            provider: "google",
            role: "farmer",
            // Google gives us a verified address, so SMS/WhatsApp OTP is not
            // forced at sign-up; onboarding still asks for the number.
            isWhatsappVerified: false
          });
          await user.save();
        } else {
          let dirty = false;
          if (!user.displayName && profile.displayName) { user.displayName = profile.displayName; dirty = true; }
          if (!user.email && email) { user.email = email; dirty = true; }
          if (!user.image && image) { user.image = image; dirty = true; }
          if (dirty) await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
);

/**
 * Replaces the package's profile lookup, which is pinned to
 * https://www.googleapis.com/oauth2/v3/userinfo - the very host whose TLS is
 * reset on some networks, meaning sign-in would die immediately after a
 * successful token exchange. Returns the same profile shape the verify callback
 * above expects (id / displayName / emails / photos).
 */
googleStrategy.userProfile = function (accessToken, done) {
  const req = https.get(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } }, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return done(new Error(`Google userinfo answered HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
      }
      try {
        const json = JSON.parse(body);
        const email = json.email || "";
        done(null, {
          provider: "google",
          id: json.sub, // stable Google user id
          displayName: json.name,
          emails: email ? [{ value: email, type: "account" }] : [],
          photos: json.picture ? [{ value: json.picture, type: "default" }] : [],
          _json: json,
        });
      } catch (parseErr) {
        done(parseErr);
      }
    });
  });
  req.setTimeout(15000, () => req.destroy(new Error(`Google userinfo timed out (${GOOGLE_USERINFO_URL})`)));
  req.on("error", (err) => done(err));
};

passport.use(googleStrategy);
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
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await userdb.findById(id);
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
    const {
      className,
      morningCareRoutine,
      nightCareRoutine,
      recommendation,
      chemicalRecommendation,
      dosagePerAcre,
      urgencyLevel,
      region,
      weatherSafetyStatus,
      language,
    } = req.body;

    const user = await userdb.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const prediction = {
      className,
      imgUrl: req.body.imgUrl || req.body.imagePath || "",
      morningCareRoutine,
      nightCareRoutine,
      recommendation,
      chemicalRecommendation,
      dosagePerAcre,
      urgencyLevel,
      region,
      weatherSafetyStatus,
      language,
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
    const user = await userdb.findById(req.user._id || req.user.id).lean();
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
    const posts = await Post.find()
      .populate("user", "displayName image")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.post("/api/posts", isAuthenticated, async (req, res) => {
  try {
    const { imageUrl, description } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - User ID missing" });
    }

    const newPost = new Post({
      user: userId,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8d",
      description: description || "Cotton leaf diagnosis field update",
      likes: [],
      comments: []
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate("user", "displayName image");
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
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

// Local (JWT) + profile-completion endpoints. Mounted here so they are
// registered before the generic /api router at the bottom of the file.
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);   // canonical: /api/users/complete-profile
app.use("/api/user", userRoutes);    // legacy aliases: /api/user/profile

app.get("/auth/google", (req, res, next) => {
  if (!clientid || !clientsecret) {
    return res.status(503).json({
      success: false,
      code: "google_not_configured",
      message: "Google Sign-In needs CLIENT_ID and CLIENT_SECRET in server/.env",
    });
  }
  // `select_account` re-shows the chooser; without it a stale Google cookie can
  // silently sign the farmer into the wrong account.
  return passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })(req, res, next);
});

// On success a JWT is handed to the SPA through the URL *fragment* (never sent
// to servers or referrers), so Google and local sign-in share one client path.
// A custom passport callback is used so a failed exchange reports WHY instead of
// dying inside Express's default handler with a generic InternalOAuthError.
app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: true }, async (err, user, info) => {
    if (err || !user) {
      const reason = err
        ? describeOAuthError(err)
        : (info && (info.message || info)) || "Google did not return a user";
      console.error(`[google-oauth] ${err ? "token exchange / profile load FAILED" : "sign-in REFUSED"}: ${reason}`);
      console.error(`[google-oauth] token endpoint: ${GOOGLE_TOKEN_URL} | redirect uri: ${GOOGLE_CALLBACK_URL}`);
      // `token_failed` = our server could not finish the exchange (network, TLS
      // interception, wrong client or unlisted redirect URI); `denied` = the
      // farmer cancelled on Google's consent screen.
      const kind = err ? "google_token_failed" : "google_denied";
      return res.redirect(`${CLIENT_ORIGIN}/login?error=${kind}&reason=${encodeURIComponent(String(reason).slice(0, 180))}`);
    }

    try {
      const token = signToken({ userId: user._id, role: user.role || "farmer" });
      // `via=google` tells the SPA that this farmer already owns an address and
      // has no local password, so the profile form must not ask for either.
      const target = user.isProfileComplete ? "/dashboard" : "/complete-profile?via=google";
      return res.redirect(`${CLIENT_ORIGIN}${target}#pw_token=${token}`);
    } catch (tokenErr) {
      console.error(`[google-oauth] signed in but the JWT could not be issued: ${tokenErr.message}`);
      // The session cookie is still valid, so send them to the app anyway.
      return res.redirect(`${CLIENT_ORIGIN}/complete-profile?via=google`);
    }
  })(req, res, next);
});

// Kept for the many existing client call sites - now understands BOTH the
// legacy Passport session and a bearer token.
app.get("/login/sucess", optionalAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  const fullUser = await userdb.findById(req.user._id || req.user.id).lean();
  if (!fullUser) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      ...publicProfile(fullUser),
      googleId: fullUser.googleId,
      badges: fullUser.badges,
      badgeProgress: fullUser.badgeProgress,
      predictions: fullUser.predictions,
    },
  });
});

// GET User Profile -> handled by routes/userRoutes.js (/api/user/profile)

// ========================================================
// ALIBABA CLOUD DASHSCOPE & QWEN COPILOT API
// ========================================================
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, reply: "Prompt message is required" });
    }

    const systemMessage = {
      role: "system",
      content: "You are Qwen AI Copilot, a highly specialized Precision Agronomist for the PlantWise AI platform. Your expertise is STRICTLY limited to agriculture, crop diseases (especially cotton in Sindh), pesticide formulations, chemical dosages, and microclimate/weather telemetry. \n\nCRITICAL INSTRUCTION: You are ABSOLUTELY FORBIDDEN from answering any questions outside of the agricultural domain. This includes questions about celebrities, movies, general knowledge, etc. \n\nIf a user asks an irrelevant question, you MUST completely ignore it and reply ONLY with this exact phrase: 'Main ek Agronomist Copilot hoon. Main sirf faslon ki beemariyon, pesticides, aur ziraat (agriculture) ke hawaley se sawalat ke jawabat de sakta hoon.' Do not provide any other details."
    };

    let aiReply = null;
    const qwenApiKey = process.env.QWEN_API || process.env.DASHSCOPE_API_KEY;

    // 1. Try Alibaba DashScope OpenAI-Compatible API (if key is set)
    if (qwenApiKey && qwenApiKey.startsWith("sk-")) {
      try {
        console.log(`🤖 Querying Alibaba DashScope (Qwen-Plus)...`);
        const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${qwenApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen-plus",
            messages: [
              systemMessage,
              { role: "user", content: message.trim() }
            ],
            temperature: 0.4,
            max_tokens: 110,
          }),
        });

        const data = await response.json();
        const extracted = data?.choices?.[0]?.message?.content;
        if (response.ok && extracted) {
          aiReply = extracted;
          console.log(`✅ Alibaba DashScope Qwen-Plus reply received`);
        }
      } catch (dashErr) {
        console.warn("⚠️ Alibaba DashScope API error, switching to fast Qwen engine:", dashErr.message);
      }
    }

    // 2. Fast Qwen Engine Fallback (Groq qwen/qwen3.8-27b)
    if (!aiReply && groq) {
      try {
        console.log(`🤖 Querying Fast Qwen Engine (qwen/qwen3.8-27b)...`);
        const groqCompletion = await groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          messages: [
            systemMessage,
            { role: "user", content: message.trim() }
          ],
          temperature: 0.4,
          max_tokens: 110,
        });

        aiReply = groqCompletion.choices[0]?.message?.content;
        if (aiReply) {
          console.log(`✅ Qwen engine reply received successfully`);
        }
      } catch (groqErr) {
        console.warn("Groq Qwen error:", groqErr.message);
      }
    }

    // 3. Secondary Fallback (OpenAI gpt-4o-mini)
    if (!aiReply && openai) {
      try {
        const gptCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            systemMessage,
            { role: "user", content: message.trim() }
          ],
          max_tokens: 110,
        });
        aiReply = gptCompletion.choices[0]?.message?.content;
      } catch (gptErr) {
        console.warn("OpenAI fallback error:", gptErr.message);
      }
    }

    if (!aiReply) {
      return res.status(500).json({
        success: false,
        reply: "AI Service temporarily unavailable. Please check your network connection.",
      });
    }

    // Clean any remaining markdown asterisks
    const cleanedReply = aiReply
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();

    return res.status(200).json({
      success: true,
      reply: cleanedReply,
    });
  } catch (error) {
    console.error("🚨 Qwen AI Chat Error:", error.message);
    return res.status(500).json({
      success: false,
      reply: `AI Service unavailable: ${error.message}`,
    });
  }
});

// Backwards compatibility alias
app.post("/qwen-chat", (req, res, next) => {
  req.url = "/api/ai/chat";
  app.handle(req, res, next);
});


app.get("/logout", (req, res, next) => {
  const signedOutUrl = `${CLIENT_ORIGIN}/?signedOut=1`;

  // JWT-only callers have no Passport session to end - just send them home.
  if (typeof req.logout !== "function" || !req.session) {
    return res.redirect(signedOutUrl);
  }

  req.logout(function (err) {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect(signedOutUrl);
    });
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
    const user = await userdb.findById(req.user._id || req.user.id);
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
    const user = await userdb.findById(req.user._id || req.user.id);
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
    const user = await userdb.findById(req.user._id || req.user.id);
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


// NOTE: a second, unreachable duplicate of /api/user/badges used to live here;
// it has been removed so there is exactly one implementation.
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

// Mount API Routes
const whatsappRoutes = require('./routes/whatsappRoutes');
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client
  // -> "Authorized redirect URIs" must contain exactly the URI printed below.
  console.log(`[google-oauth] redirect uri to authorise in Google Cloud Console: ${GOOGLE_CALLBACK_URL}`);
});