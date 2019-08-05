# Serverless Sumo Typescript

A GraphQL based API starter built in typescript. This is based on the official node / typescript template.

## Getting Started

### Install Node

Install node/npm via homebrew (macOS):

`brew install node`

Or manually by visiting the [node website](https://nodejs.org/en/).

### Install Serverless

Install the serverless framework:

`npm install serverless -g`

### Install Package Dependencies

From the project directory run:

`npm install`

### Start the Local Database

You can use a convenience script to start dynamo via docker:

`npm run startDynamo`

### Start the Project

To start the project locally be sure to include the 'start' command on the local serverless boot:

`sls serverless start`
