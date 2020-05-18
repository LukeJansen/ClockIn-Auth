const express = require('express')
const jwt = require('jsonwebtoken')
const Auth = require('../models/auth')
const User = require('../models/user')

const router = express.Router()

router.post('/refresh', getAuth, getUser, (req, res) => {
    const refreshToken = req.body.RefreshToken

    if (refreshToken == null) return res.status(400).json({message: "Refresh Token Not Provided"})
    if (!res.auth.RefreshTokens.includes(refreshToken)) return res.status(403).json({message: "Refresh Token Not Valid"})

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        res.status(200).json({message: "Access Token Generated", AccessToken: generateAccessToken(res.user.Type)})
    })
})

router.post('/check', (req, res) => {
    const accessToken = req.body.AccessToken
    const userType = req.body.UserType

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: err.message})
        if (user.UserType >= userType){
            return res.sendStatus(200)
        }
        else{
            return res.status(403).json({message: "Incorrect Privileges"})
        }
    })
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

function generateAccessToken(userType) {
    return jwt.sign({UserType: userType}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
}

function generateRefreshToken(userType) {
    return jwt.sign({UserType: userType}, process.env.REFRESH_TOKEN_SECRET)
}

module.exports.router = router
module.exports.access = generateAccessToken
module.exports.refresh = generateRefreshToken