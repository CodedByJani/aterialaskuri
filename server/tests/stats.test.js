
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

describe('Stats API', () => {

    test('GET /api/stats palauttaa 401 ilman tokenia', async () => {
        const res = await request(app).get('/api/stats')

        expect(res.statusCode).toBe(401)
    })

    test('GET /api/stats pitäisi hakea kaikki tilastotiedot', async () => {
        await DailyStat.create({
            date: '2026-05-18',
            units: [{
                unitName: 'Testiyksikkö',
                meals: [{type: 'lounas', count: 10}]
            }]
        })
                
        const res = await request(app)
            .get('/api/stats')
            .set('Authorization', `Bearer ${token}`)

        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThan(0)
        
    })
})

