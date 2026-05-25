const request = require('supertest')
const app = require('../index')
const DailyStat = require('../models/DailyStat')

const UNIT = "Testiyksikkö"

const {
    connectDB,
    closeDB,
    clearDB,
    createToken
} = require('./testSetup')

let token

beforeAll(async () => {
    await connectDB()
    token = createToken()
})

afterEach(async () => {
    await clearDB()
})

afterAll(async () => {
    await closeDB()
})

describe('UPDATE-COUNT API', () => {

    test('401 ilman tokenia', async () => {
        const res = await request(app)
            .patch('/api/stats/update-count')
            .send({
                date: '2026-05-18',
                unitName: UNIT,
                mealType: 'lounas',
                newCount: 5
            })

        expect(res.statusCode).toBe(401)
    })

    test('luo uuden päivän jos ei ole olemassa', async () => {
        const res = await request(app)
            .patch('/api/stats/update-count')
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '2026-05-18',
                unitName: UNIT,
                mealType: 'lounas',
                newCount: 10
            })

        expect(res.statusCode).toBe(200)
        expect(res.body.date).toBe('2026-05-18')

        const saved = await DailyStat.findOne({ date: '2026-05-18' })
        expect(saved).toBeTruthy()
        expect(saved.units.length).toBe(1)
    })
    test('päivittää olemassa olevan meal countin', async () => {
        await DailyStat.create({
            date: '2026-05-19',
            units: [{
                unitName: UNIT,
                meals: [{
                    type: 'lounas',
                    count: 3
                }]
            }]
        })

        const res = await request(app)
            .patch('/api/stats/update-count')
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '2026-05-19',
                unitName: UNIT,
                mealType: 'lounas',
                newCount: 20
            })

        expect(res.statusCode).toBe(200)

        const updated = await DailyStat.findOne({ date: '2026-05-19' })
        const meal = updated.units[0].meals.find(m => m.type === 'lounas')

        expect(meal.count).toBe(20)
    })

    test('luo uuden meal type jos sitä ei ole', async () => {
        await DailyStat.create({
            date: '2026-05-20',
            units: [{
                unitName: UNIT,
                meals: []
            }]
        })

        const res = await request(app)
            .patch('/api/stats/update-count')
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '2026-05-20',
                unitName: UNIT,
                mealType: 'aamiainen',
                newCount: 7
            })

        expect(res.statusCode).toBe(200)

        const updated = await DailyStat.findOne({ date: '2026-05-20' })
        const meal = updated.units[0].meals.find(m => m.type === 'aamiainen')

        expect(meal.count).toBe(7)
    })
    test('400 jos newCount on negatiivinen', async () => {
        const res = await request(app)
            .patch('/api/stats/update-count')
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '2026-05-18',
                unitName: UNIT,
                mealType: 'lounas',
                newCount: -5
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBeDefined()
    })
    test('400 jos newCount ei ole numero', async () => {
        const res = await request(app)
            .patch('/api/stats/update-count')
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '2026-05-18',
                unitName: UNIT,
                mealType: 'lounas',
                newCount: "abc"
            })

        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBeDefined()
    })
})