# SimpleData

This is a tool for serving data from JSON files. It is meant to be used
as a Mock API. This can be useful when you need to develop the front-end separate
from the backend.

## Installation

`npm install -g simple-data`

## Commands

\* `sdata` can be used in place of `simple-data`

Initialize a new project in the current folder - `simple-data init`

Start the server - `simple-data start`

Generate a resource type in the db - `simple-data generate <resource_name>`

Import data from a local file - `simple-data import <file_path>`

Import data from a url - `simple-data import <url>`

## Settings

Initializing a project is not required. When a project is initialized, it
creates a simple.json file that includes all settings, and generates a blank database file in data/db.json. The default settings are as follows:

```json
{
  "portNumber": 9000,
  "dataDirectory": "data",
  "dataSource": "db.json",
  "apiStandard": false,
  "namespace": ""
}
```

#### Description of Settings

**portNumber** - Allows you to set the port number that the server will listen on

**dataDirectory** - The directory that the server will put the data file in. In the future this will also be the location of all factories also.

**dataSource** - The filename for the actual data file

**apiStandard** - This is the standard that is used for the API. In the future there will be options for [json:api](http://jsonapi.org/) and [swagger](http://swagger.io/), but for now only false is allowed. Also feel free to request other standards.

**namespace** - This is text that should be prepended to all requests. Ex. If you wanted to access a resource called "users", and you set the namespace to "api/v1", you would make the request to `http://localhost:<portNumber>/api/v1/users`

## Requests

At this time the server supports the GET, POST, PUT, PATCH, and DELETE methods. It also has sort and filter functionality for GET requests.

#### Example Requests

GET `http://localhost:9000/users/1`

GET (with filters) `http://localhost:9000/posts?tag=development&author=4`

GET (with sortBy) `http://localhost:9000/posts?sortBy=created`

POST `http://localhost:9000/users/1`

PUT `http://localhost:9000/users/1`

PATCH `http://localhost:9000/users/1`

DELETE `http://localhost:9000/users/1`


## Data Storage

Currently all data is entered in one file, but this will be optional in the future. A data file currently uses the following format.

#### Data Format

```json
{
  "resource_example": [
    {
      "id": "1",
      "some_field": "some field value"
    },
    {
      "id": "2",
      "some_field": "a different field value"
    }
  ],
  "other_resource_example": [
    {
      "id": "1",
      "some_field": "some field value"
    },
    {
      "id": "2",
      "some_field": "a different field value"
    }
  ]
}
```

#### Data Example

```json
{
  "todos": [
    {
      "id": "1",
      "description": "Get the milk",
      "owner_id": "2"
    },
    {
      "id": "2",
      "description": "Clean out the garage",
      "owner_id": "1"
    },
    {
      "id": "3",
      "description": "Mow the lawn",
      "owner_id": "1"
    }
  ],
  "users": [
    {
      "id": "1",
      "username": "suzyq123"
    },
    {
      "id": "2",
      "username": "johnnie_doe"
    }
  ]
}
```
