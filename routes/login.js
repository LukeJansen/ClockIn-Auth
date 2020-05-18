const express = require('express')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const router = express.Router()

const Auth = require('../models/auth')
const User = require('../models/user')
const Token = require('./token')

router.post('/login', getUser, getAuth, async (req, res) => {
    try{
        if (await bcrypt.compare(req.body.Password, res.auth.Hash)){
            const refreshToken = Token.refresh(res.user.Type)
            res.auth.RefreshTokens.push(refreshToken)
            await res.auth.save()

            return res.status(200).json({message: "Logged In", RefreshToken: refreshToken, UserID: req.body.UserID, UserType: res.user.Type})
        }
        else{
            return res.status(401).json({message: "Bad Credentials"})
        }
    }
    catch (err){
        console.log(err)
        return res.status(500).json({message: err.message})
    }
})

router.post('/logout', getAuth, async (req, res) => {
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
    const password = crypto.randomBytes(5).toString('hex')
    try{
        auth.Hash = await bcrypt.hash(password, 10)
        await auth.save()
        return res.status(201).json({message: "User Registered", password: password})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.post('/remove', getAuth, async (req, res) => {
    try{
        res.auth.remove()
        return res.status(200).json({message: "Removed User"})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.post('/reset', getAuth, async (req,res) => {
    try{
        let password = crypto.randomBytes(5).toString('hex')
        res.auth.Hash = await bcrypt.hash(password, 10)
        res.auth.Reset = false;
        await res.auth.save()
        return res.status(201).json({message: "User Password Reset", password: password})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
})

router.post('/passwordChange', getAuth, async (req, res) => {
    const currentPass = req.body.CurrentPass
    const newPass = req.body.NewPass
    
    try{
        if (await bcrypt.compare(currentPass, res.auth.Hash)){
            res.auth.Hash = await bcrypt.hash(newPass, 10)
            await res.auth.save()

            return res.status(200).json({message: "Password Changed"})
        }
        else{
            return res.status(401).json({message: "Bad Credentials"})
        }
    }
    catch (err){
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
        if (req.body.Email != null){
            user = await User.findOne({Email: req.body.Email})
        }
        else{
            user = await User.findById(req.body.UserID)
        }

        if (user == null){
            return res.status(404).json({message: "Cannot Find User"})
        }
    } catch (err){
        return res.status(500).json({message: err.message})
    }

    res.user = user
    req.body.UserID = user._id
    next()
}

module.exports = router