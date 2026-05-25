const request = require('supertest')
const app = require('../index')
const DailyStat = require('../models/DailyStat')

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

describe('History API', () =>{

    test('GET /api/stats/history palauttaa 401 ilman tokenia', async () => {
        const res = await request(app).get('/api/stats/history?unitName=X')

        expect(res.statusCode).toBe(401)
    })

    test('GET /api/stats/history palauttaa 400 jos unitName on tyhjä', async () => {
        const res = await request(app)
            .get('/api/stats/history')
            .set('Authorization', `Bearer ${token}`)

        expect(res.statusCode).toBe(400)
    })

    test('GET /api/stats/history pitäisi tyhjä lista kun dataa ei ole', async () => {
        const res = await request(app)
            .get('/api/stats/history?unitName=Testiyksikkö')
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual([])
    })

    test('GET /api/stats/history palauttaa unitin meal-historian', async () => {
        await DailyStat.create({
            date: '2026-05-18',
            units: [{
                unitName: 'Testiyksikkö',
                meals: [{ type: 'lounas', count: 5 }]
            }]
        })

        const res = await request(app)
            .get('/api/stats/history?unitName=Testiyksikkö')
            .set('Authorization', `Bearer ${token}`)

        expect(res.statusCode).toBe(200)
        expect(res.body[0].meals.length).toBe(1)
    })
    test('GET /api/stats/history Suodattaa ajanjaksojen mukaan', async () => {
        await DailyStat.create([
            {
                date: '2026-05-10',
                units: [{
                    unitName: 'Testiyksikkö',
                    meals: [{ type: 'lounas', count: 5 }]
                }]
            },
            {
                date: '2026-05-20',
                units: [{
                    unitName: 'Testiyksikkö',
                    meals: [{ type: 'lounas', count: 10 }]
                }]
            }
        ])

        const res = await request(app)
            .get('/api/stats/history')
            .query({
                unitName: 'Testiyksikkö',
                startDate: '2026-05-15',
                endDate: '2026-05-25'
            })
            .set('Authorization', `Bearer ${token}`)

        expect(res.statusCode).toBe(200)

        expect(res.body.length).toBe(1)
        expect(res.body[0].date).toBe('2026-05-20')
    })
})