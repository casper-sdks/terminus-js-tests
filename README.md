## Terminus JS

This repo holds a set of tests to be run against the Casper Typescript SDK.

Points to note are:

- The tests can be run manually via the Terminus project [here](https://github.com/casper-sdks/terminus) 
- The tests are built using Cucumber features


### How to run locally CLI
- Install latest node version

- Clone repo and start NCTL (please note the NCTL Casper node version in the script 'docker-run')

  ```bash
  git clone git@github.com:casper-sdks/terminus-js-tests.git
  cd terminus-js-tests/scripts
  chmod +x docker-run && ./docker-run
  chmod +x docker-copy-assets && /docker-copy-assets 
  cd ..
  ```

- npm install required SDK branch and run the tests

  ```bash
  npm uninstall casper-js-sdk
  rm package-lock.json && rm -rf node_modules
  git clone https://github.com/casper-ecosystem/casper-js-sdk.git -b [required-branch]
  npm install casper-js-sdk
  npm test
  ```

- TODO script the above

- JUnit test results will be output to /reports

### How to run locally IDE

Alternatively the tests can be run using an IDE

They are developed using JetBrains WebStorm





