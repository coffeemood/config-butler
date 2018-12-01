# *Config Butler* 🕴


## Introduction

> A uniform and elegant way to manage multi-environment native web config files 

Config Butler introduces an easy way to manage native web config files in a purposeful, modularised and uniform manner.

The philosophy behind the structure of this set up is:
> Config should follow business logic while at the same time cater for sound development practices


## Installation: 

```
npm install config-butler 
```

## Usage

1. Create a new configuration template in your project's configuration folder with the following format 

```js
// e.g: configurations/appConfig.js

module.exports = {
  appConfig: {
    topBanner: {
      disclaimer: {
        dev: 'this project is open source and will never ask for your money ',
        prod: 'this project is open source and will never ask for your money',
      }
    }
  }
};
``` 

2. After you are happy with your configuration and are ready to include this in your project, create a `config-files.json` (_you can name it however you like_) 
in the same folder, then add a new entry as the same name of the config file created. 

```js
// configurations/config-files.json
[  
  "appConfig"
]
```

That's it! Simple isn't it? 🍰

3. Now, before your project is built, add an entry to compile your config like follow

```bash
$ config-compile  'configurations' 'dev prod' 'Dev Production' 
                        $1             $2            $3 

# $1: Configs location 
# $2: Environments to compile 
# $3: Folders to return configuration files on 
```

The end result is the compiler will compile a corresponding `configuration.js` file to each specified environment like follow 

```js
// Dev/configuration.js 

window.sample = "https://dev.butlerio.com.au"
window.logServer = "https://dev.butlerio-logs.com.au"
window.apiSocket = "https://dev.api.butlerio.com.au"
```

🍻🍻🍻

                
## Notes

Arrays are considered the last object in a config, reason being arrays might be of different sizes for each environment. This means each environment must have their own array

```js

"availableCurrencies": {
      "dev": [
        "AUD",
        "USD",
        "EUR",
      ],
      "prod": [
        "USD"
      ]
    }

```



