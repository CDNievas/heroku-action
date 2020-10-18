# Heroku Action
A GitHub Action for deploying on Heroku

## Basic Example
In this example you must have a Procfile in the project directory and create the following file (.github/workflows/main.yml)

```yaml
name: Deploy

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: CDNievas/heroku-action@v1.0 # This is the action
        with:
          heroku_email: "example@email.com"
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "this-is-an-example"
```


## Options
You can configure the deploy to heroku passing some options to the action

| Name            | Type     | Description                                                                                                                                  | Example                             | Required | Default                |
|-----------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|----------|------------------------|
| heroku_api_key  | string   | Used like a password for authentication. Visit your profile settings on Heroku to obtain.                                                    | "0a3efa20-0a3efa20a3efa2"           | true     | -                      |
| heroku_email    | string   | Heroku account's email.                                                                                                                      | "example@email.com"                 | true     | -                      |
| heroku_app_name | string   | The name of the Heroku app that you are deploying. It must be all in minus and separated using "-".                                          | "this-is-an-example"                | true     | -                      |
| branch          | string   | The name of the repository branch that you want to upload to Heroku.                                                                         | "main", "deploy", "test"            | false    | Uploads "HEAD" content |
| useforce        | bool     | Set in true if you want to add --force to the push to Heroku command.                                                                        | true, false                         | false    | false                  |
| appdir          | string   | Directory that you want to deploy to Heroku.                                                                                                 | "project", "deploy"                 | false    | Root of repository     |
| procfile        | string   | Content of the Procfile. It will be created dynamically and uploaded only to Heroku.                                                         | "web: npm start"                    | false    | No Procfile creation   |
| dynamicFiles    | bool     | Set in true if you need to upload to Heroku files created dynamically by others steps in the GitHub Action.                                  | true, false                         | false    | false                  |
| buildpacks      | string | If you want to add custom buildpacks to the project pass the URLs in string array format. There will be installed respecting the order used. | "['url_buildpack1','url_buildpack2']" | false    | No buildpacks          |
| env_file        | string   | Path to a .env file                                                                                                                          | ".env", "secrets/.env/"             | false    | No env file            |


## Example with some options

```yaml
name: Deploy

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: CDNievas/heroku-action@v1.0 # This is the action
        with:
          heroku_email: "example@email.com"
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "this-is-an-example"
          useforce: true,
          dynamicFiles: true,
          procfile: "worker: npm start",
          buildpacks: "['https://github.com/heroku/heroku-buildpack-nodejs.git','https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git']"
```
