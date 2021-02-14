const request = require("request");
const repo = process.env.TRAVIS_REPO.replace("/", "%2F");
const token = process.env.TRAVIS_TOKEN;

const config = {
  uri: `https://api.travis-ci.com/repo/${repo}/requests`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Travis-API-Version": "3",
    "Authorization": `token ${token}`
  },
  data: `{
    "request": {
      "branch": "master"
    }
  }`
};

request.post(config);