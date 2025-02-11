import 'reflect-metadata'
import 'dotenv-safe/config'
import { COOKIE_NAME, __prod__ } from './constants'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'
import { createConnection } from 'typeorm'
import { Post } from './entities/Post'
import { User } from './entities/User'
import path from 'path'

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: !__prod__,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User], // TODO
    })
    // create tables in new
    if (__prod__) {
        console.log('Running migrations...')
        await conn.runMigrations()
    }
    console.log('__prod__', __prod__)

    // create server instance
    const app = express()

    // create Redis instance
    const RedisStore = connectRedis(session)
    const redis = new Redis(process.env.REDIS_URL)

    // express needs to know that 1 nginx sits in front of the server
    // otherwise sessions and cookies will break
    app.set('trust proxy', 1)

    console.log('cors origin: ', process.env.CORS_ORIGIN)

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        })
    )

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redis, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                secure: __prod__, // cookie only works with https
                domain: __prod__ ? '.codewander.club' : undefined,
                sameSite: 'lax',
            },
            saveUninitialized: false,
            secret: process.env.SECRET, // TODO: switch this to environment variable
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    })

    apolloServer.applyMiddleware({ app, cors: false })

    app.listen(parseInt(process.env.PORT), () => {
        console.log(`server started on localhost:${process.env.PORT}`)
    })
}

main().catch((err) => console.error(err))
