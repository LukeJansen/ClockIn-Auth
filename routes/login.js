const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const Auth = require('../models/auth')
const User = require('../models/user')
const Token = require('./token')

router.post('/login', getAuth, getUser, async (req, res) => {
    if (res.auth.Reset) return res.status(400).json({message: "Password Reset Requested"})

    try{
        if (await bcrypt.compare(req.body.Password, res.auth.Hash)){
            const refreshToken = Token.refresh(res.user.Type)
            res.auth.RefreshTokens.push(refreshToken)
            await res.auth.save()

            return res.status(200).json({message: "Logged In", RefreshToken: refreshToken})
        }
        else{
            return res.status(401).json({message: "Bad Credentials"})
        }
    }
    catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.delete('/logout', getAuth, async (req, res) => {
    if (req.body.RefreshToken == null) return res.status(400).json({message: "Refresh Token Not Provided"})

    try{
        res.auth.RefreshTokens.remove(req.body.RefreshToken)
        await res.auth.save()
        return res.status(200).json({message: "Logged Out"})
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    
})

router.post('/register', async (req, res) => {
    const auth = new Auth()
    auth.UserID = req.body.UserID
    try{
        auth.Hash = await bcrypt.hash(req.body.Password, 10)
        await auth.save()
        return res.status(201).json({message: "User Registered"})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.delete('/remove', getAuth, async (req, res) => {
    try{
        res.auth.remove()
        return res.status(200).json({message: "Removed User"})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.post('/requestReset', getAuth, async (req, res) => {
    try{
        if (res.auth.Reset) return res.status(400).json({message: "Reset Already Requested"})

        res.auth.Reset = true
        await res.auth.save()

        return res.status(200).json({message: "Reset Requested"})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.post('/reset', getAuth, async (req,res) => {
    if (!res.auth.Reset) return res.status(400).json({message: "This User Does Not Have A Reset Requested"})

    try{
        res.auth.Hash = await bcrypt.hash(req.body.Password, 10)
        res.auth.Reset = false;
        await res.auth.save()
        return res.status(201).json({message: "User Password Reset"})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

async function getAuth(req, res, next){
    let auth
    try {
        auth = await Auth.findOne({UserID: req.body.UserID})
        if (auth == null){
            return res.status(404).json({message: "Cannot Find User With Given ID"})
        }
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    res.auth = auth
    next()
}

async function getUser(req, res, next){
    let user
    try {
        user = await User.findById(req.body.UserID)
        if (user == null){
            return res.status(404).json({message: "Cannot Find User With Given ID"})
        }
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    res.user = user
    next()
}

module.exports = router