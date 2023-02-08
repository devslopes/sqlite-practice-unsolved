# Sqlite Assignment
In this assignment we will build a sqlite database and test that you set it up correctly!

## Why Sqlite?

In general, SQL is a skill that you will need if you ever find yourself doing any sort of backend work. The reality of most database systems is that the actual stored data is only accessible by a running app. For example when you run a PostGres or MySQL database, you are actually running a Postgres app or a MySQL app on your computer. Those application will manage where your data is stored for you, and in all likelihood it spreads that information around your computer doing a bunch of optimizations.


SQlite is different though. SQlite's storage ALL lives inside of a file that you specify! This means two things for us from an educational perspective:

1. It's a little less work getting started
2. We can write better tests to whatever you submit


## The Task

We want to build an app that allows users to favorite dogs. This should be a many to many relationship which means that a User should be able to favorite many dogs, and a Dog should be able to be favorited by many users.


## Part 1: Setting Up the Database

See part1.md

### Part 2: Creating some queries

See part2.md
