const express = require('express')
const router = express.Router()
const DailyStat = require('../models/DailyStat')
const authToken = require('../middleware/auth')
const ActivityLog = require('../models/ActivityLog')

router.get('/', authToken, async (req, res) => {
    const { startDate, endDate } = req.query
    try {
        let query = {}

        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate }
        }

        const stats = await DailyStat.find(query).sort({ date: 1 })
        res.json(stats)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/daily', authToken, async (req, res) => {
    try {
        const newDay = new DailyStat(req.body)
        await newDay.save()
        res.status(201).json(newDay)
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: 'Day already exists or invalid data' })
    }
})

// This should update just one meal in case of mistakes, instead of having to overwrite the entire day
router.patch('/update-count', authToken, async (req, res) => {
    let { date, unitName, mealType, newCount } = req.body
    const parsedCount = Number(newCount)

    if (isNaN(parsedCount) || parsedCount < 0) {
        return res.status(400).json({
            error: "Virheellinen syöte. Ole hyvä ja syötä vain numeroita."
        })
    }

    try {
        let dailyStat = await DailyStat.findOne({ date: date })

        if (!dailyStat) {
            dailyStat = new DailyStat({ date: date, units:[] })
        }

        let unit = dailyStat.units.find(u => u.unitName === unitName)

        if (!unit) {
            dailyStat.units.push({ unitName: unitName, meals:[] })
            unit = dailyStat.units[dailyStat.units.length - 1]
        }

        let meal = unit.meals.find(m => m.type === mealType)

        if (!meal) {
            unit.meals.push({ type: mealType, count: parsedCount })
        } else {
            meal.count = parsedCount
        }

        await dailyStat.save()

        await ActivityLog.create({
            email: req.user.email,
            action: 'UPDATE_MEAL',
            details: `Päivitti ravintolan ${unitName} aterian '${mealType}' määräksi ${parsedCount} (Päivämäärä: ${date})`
        })

        res.json(dailyStat)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

router.get('/logs', authToken, async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100)
        res.json(logs)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
