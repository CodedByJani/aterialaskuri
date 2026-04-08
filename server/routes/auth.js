const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { Resend } = require('resend')
const MagicToken = require('../models/MagicToken')
const ActivityLog = require('../models/ActivityLog')

const resend = new Resend(process.env.RESEND_API_KEY)

router.post('/magic-link', async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Sähköposti puuttuu" })
    
    try {
        const token = crypto.randomBytes(32).toString('hex')
        await MagicToken.create({ email, token })

        const loginUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`

        console.log("DEBUGGING: Link being sent is:", loginUrl)

        await resend.emails.send({
            from: 'Ruokailusovellus <onboarding@resend.dev>',
            to: [email],
            subject: 'Kirjautuminen ruokasovellukseen',
            text: `Hei!
            
            Voit kirjautua sisään sovellukseen klikkaamalla alla olevaa linkkiä.
            Linkki on voimassa tunnin ajan.
            
            ${loginUrl}
            
            Jos et tilannut tätä viestiä, voit jättää sen huomiotta.`,
        })

        res.json({ message: "Linkki lähetetty!" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/verify', async (req, res) => {
    const { token } = req.query

    if (token === "demo123") {
        const sessionToken = jwt.sign(
            { email: "testikäyttäjä@koulu.fi" },
            process.env.JWT_SECRET
        )

        await ActivityLog.create({
            email: "testikäyttäjä@koulu.fi",
            action: 'LOGIN',
            details: 'User signed in with demo login.'
        })

        return res.json({ token: sessionToken, email: "testikäyttäjä@koulu.fi" })
    }

    try {
        const found = await MagicToken.findOne({ token })
        if (!found) return res.status(401).json({ error: "Linkki on vanhentunut" })

        const sessionToken = jwt.sign({ email: found.email }, process.env.JWT_SECRET, { expiresIn: '90d' })

        await MagicToken.deleteOne({ _id: found._id })

        await ActivityLog.create({
            email: found.email,
            action: 'LOGIN',
            details: 'User signed in with email.'
        })

        res.json({ token: sessionToken, email: found.email })
        console.log(sessionToken)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
