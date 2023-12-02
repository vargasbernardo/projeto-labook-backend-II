import express from 'express'
import { TokenManager } from '../services/TokenManager'
import { IdGenerator } from '../services/IdGenerator'
import { HashManager } from '../services/HashManager'
import { UserDatabase } from '../database/UserDatabase'
import { UserBusiness } from '../business/UserBusiness'
import { UserController } from '../controller/UserController'

export const userRouter = express.Router()

const userController = new UserController(
    new UserBusiness(
        new UserDatabase(),
        new IdGenerator(),
        new TokenManager(),
        new HashManager()
    )
)

userRouter.post('/signup', userController.signup)
userRouter.post('/login', userController.login)