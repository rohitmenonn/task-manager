const express = require('express')
require('./db/db')
const User = require('./models/User')
const Task = require('./models/Task')

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())

// User Routes

app.post('/users', async (req,res) => {
    const user = new User(req.body)
    try{
        await user.save()
        res.status(201).send(user)
    } catch(err) {
        res.status(400).send(err)
    }
})

app.get('/users', async (req,res) => {
    try{
        const users = await User.find({})
        res.status(201).send(users)
    } catch(err) {
        res.status(400).send(err)
    }
})

app.get('/users/:id', async (req,res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).send()
        res.send(user)
    } catch(err){
        res.status(500).send(err)
    }
})

app.patch('/users/:id', async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) return res.status(400).send({ error: 'Invalid updates'})

    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if(!user) return res.status(404).send()
        res.send(user)
    } catch(err){
        res.status(400).send(err)
    }
})

app.delete('/users/:id', async (req,res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user) return res.status(404).send()
        res.send(user)
    } catch(err){
        res.status(500).send(err)
    }
})

// Task routes

app.post('/tasks', async (req,res) => {
    const task = new Task(req.body)
    try{
        await task.save()
        res.status(201).send(task);
    } catch(err) {
        res.status(400).send(err)
    }
})

app.get('/tasks', async (req,res) => {
    try{
        const tasks = await Task.find({})
        res.send(tasks);
    } catch(err) {
        res.status(500).send(err)
    }
})

app.get('/tasks/:id', async (req,res) => {
    try{
        const task = await Task.findById(req.params.id)
        if(!task) return res.status(404).send()
        res.send(task);
    } catch(err){
        res.status(500).send(err)
    }
})

app.patch('/tasks/:id', async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) return res.status(400).send({ error: 'Invalid updates'})

    try{
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if(!task) return res.status(404).send()
        res.send(task)
    } catch(err){
        res.status(400).send(err)
    }
})

app.delete('/tasks/:id', async (req,res) => {
    try{
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task) return res.status(404).send()
        res.send(task)
    } catch(err){
        res.status(500).send(err)
    }
})

app.listen(port, () => {
    console.log('Server running!')
})