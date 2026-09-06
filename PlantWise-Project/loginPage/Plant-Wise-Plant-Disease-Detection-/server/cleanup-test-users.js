// One-off cleanup: remove the throwaway accounts created while verifying the
// auth routes (they live in the real Atlas cluster and must not stay there).
require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const userdb = require("./model/userSchema");

const OUT = "./cleanup-report.txt";
const log = (msg) => fs.appendFileSync(OUT, `${msg}\n`);

const run = async () => {
  fs.writeFileSync(OUT, "");
  // Connect exactly like db/conn.js (no dbName) so we touch the same database.
  await mongoose.connect(process.env.DATABASE);
  log(`database in use: ${mongoose.connection.name}`);
  log(`total users: ${await userdb.countDocuments({})}`);
  const filter = {
    $or: [
      { email: { $regex: "^authsmoke\\.", $options: "i" } },
      { email: { $regex: "@plantwise\\.test$", $options: "i" } },
      { email: "smoke.probe.ui@example.com" },
      { email: "probe-ui@example.com" },
    ],
  };
  const victims = await userdb.find(filter).select("email fullName").lean();
  log(`matched ${victims.length}: ${victims.map((v) => v.email).join(", ") || "-"}`);
  if (victims.length) {
    await userdb.deleteMany({ _id: { $in: victims.map((v) => v._id) } });
    log(`deleted ${victims.length}; remaining users: ${await userdb.countDocuments({})}`);
  }
  await mongoose.disconnect();
};

run().catch((e) => { log(`ERROR ${e.message}`); process.exit(1); });
