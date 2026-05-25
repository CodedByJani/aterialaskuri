const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const MagicToken = require("../models/MagicToken");
const ActivityLog = require("../models/ActivityLog");

// Resend on null testiympäristössä
const resend =
  process.env.NODE_ENV === "test"
    ? null
    : new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/magic-link
 * Sends a magic link to the provided email
 */
router.post("/magic-link", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Sähköposti puuttuu" });
  }

  //if (!email.endsWith("@esedu.fi")) {
  //return res.status(400).json({
  //error: "Käytä esedu.fi sähköpostia",
  //});
  //}

  try {
    // Check if token already exists for this email (prevent spam)
    //const existingToken = await MagicToken.findOne({ email });
    //if (existingToken) {
    //return res.status(429).json({
    //error:
    //"Linkki on jo lähetetty tälle sähköpostille. Yritä uudelleen 15 minuutin kuluttua.",
    //});
    //}

    const token = crypto.randomBytes(32).toString("hex");
    await MagicToken.create({ email, token });

    const loginUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    console.log("✅ Magic link sent");

    if (process.env.NODE_ENV !== "test") {
      await resend.emails.send({
        from: "Ruokailusovellus <onboarding@resend.dev>",
        to: [process.env.TEST_EMAIL || "aterialaskuri.testi@gmail.com"],
        subject: "Kirjautuminen ruokasovellukseen",
        html: `
                <h2>Hei!</h2>
                <p>Voit kirjautua sisään sovellukseen klikkaamalla alla olevaa linkkiä.</p>
                <p><strong>Linkki on voimassa tunnin ajan.</strong></p>
                <p>
                    <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Kirjaudu sisään
                    </a>
                </p>
                <p>Tai kopioi tämä linkki selaimeen:</p>
                <p><code>${loginUrl}</code></p>
                <hr>
                <p><small>Jos et tilannut tätä viestiä, voit jättää sen huomiotta.</small></p>
            `,
      });
    }

    res.json({
      message: "Kirjautumislinkki lähetetty sähköpostiisi",
      email: email,
    });
  } catch (err) {
    console.error("❌ Magic link error:", err.message);
    res.status(500).json({
      error:
        "Sähköpostin lähettäminen epäonnistui. Yritä uudelleen hetken kuluttua.",
    });
  }
});

/**
 * GET /api/auth/verify
 * Verifies magic token and returns JWT
 */
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Linkki puuttuu" });
  }

  try {
    const found = await MagicToken.findOne({ token });

    if (!found) {
      return res
        .status(401)
        .json({ error: "Linkki on vanhentunut tai virheellinen" });
    }

    const sessionToken = jwt.sign(
      { email: found.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    await MagicToken.deleteOne({ _id: found._id });

    await ActivityLog.create({
      email: found.email,
      action: "LOGIN",
      details: "User signed in with magic link.",
    });

    console.log("✅ User logged in");

    res.json({
      token: sessionToken,
      email: found.email,
      expiresIn: "24h",
    });
  } catch (err) {
    console.error("❌ Verify error:", err.message);
    res
      .status(500)
      .json({ error: "Kirjautuminen epäonnistui. Yritä uudelleen." });
  }
});

module.exports = router;
