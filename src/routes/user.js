const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router()
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1000000, // 1MB1
    },   
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpeg, jpg or png file'))
        }
        cb(undefined, true)
    }                     
})

const User = require('../models/User')

const auth = require('../middleware/auth')

router.post('/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(err){
        res.status(400).send(err)
    }
})

router.post('/', async (req,res) => {
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(err) {
        res.status(400).send(err)
    }
})

router.get('/me', auth, async (req,res) => {
    res.send(req.user)
})

router.post('/logout', auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch(err) {
        res.status(500).send()
    }
})

router.post('/logoutall', auth, async(req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(err) {
        res.status(500).send()
    }
})

router.patch('/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) return res.status(400).send({ error: 'Invalid updates'})

    try{
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)

    } catch(err){
        res.status(400).send(err)
    }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    res.send('Uploaded')
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar removed!')
})

router.get('/:id/avatar', async (req,res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) throw new Error()

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch(err){
        res.status(404).send()
    }
})

module.exports = router