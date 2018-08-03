# Commit2Win

## Live
https://commit2win-server.herokuapp.com/

## Client Source
https://github.com/thinkful-ei20/ghub-tracker-client

## Description
Commit2Win is a web app created with the goal of using competition to encourage better version control usage. By tracking Github contributions, it allows users to compete with each other on a day-to-day basis. Users are further encouraged to compete with a challenge system that allows a user to directly compare their contributions with another.

## API Documentation
User routes: `/api/users`  
```
GET - / - Get all users
```
```
POST - /register - Register a new user
```
```
GET - /profile/:username - Get public profile data for user with :username
```
```
GET - /dashboard - Get logged in users dashboard
```
```
GET - /addFriend/:receivingUserId - Send friend request to user with id :receivingUserid
```
```
GET - /acceptFriend/:sendingUserId - Accept friend request from user with id :sendingUserId
```
```
GET - /profile - Get profile data for logged in user
```

Leaderboard routes: `/api/leaderboard`  
```
GET - / - Get public leaderboard sorted by rank
```

Challenges routes: `/api/challenges`  
```
GET - / - Get all challenges for logged in user
```
```
GET - /send/:receivingUserId - Send challenge to user with id :receivingUserId
```
```
GET - /accept/:sendingUserId - Accept challenge from user with id :sendingUserId
```
```
GET - /deny/:sendingUserId - Deny challenge from user with id :sendingUserId
```
```
GET - /delete/:receivingUserId - Delete challenge from logged in user to user with id :receivingUserId
```

Auth routes: `/api`  
```
POST - /login - Login user using username and password
```
```
POST - /refresh - Refreshes auth token
```

## Technologies
- Express
- MongoDB/MongooseODM
- @octokit/rest
- lodash
- memory-cache
- passport
