const core = require("@actions/core");
const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { hasUncaughtExceptionCaptureCallback } = require("process");

var inVars = getInputVars();
catNetrcFile(inVars);
gitCredentials(inVars);
createProcfile(inVars);
loginHeroku();
selectHerokuApp(inVars);
addBuildpacks(inVars);
addConfigs(inVars);
addDynamicFiles(inVars);
deploy(inVars);

function gitCredentials({email}){
  execComm(`git config --global user.name "Automated Heroku Deploy"`);
  execComm(`git config --global user.email "${email}"`);
}

function deploy({useforce, branch,appdir}){

  if (appdir === "") {
    execComm(`git push heroku ${branch}:refs/heads/master ${useforce? "--force" : ""}`);
  } else {
    execComm(
      `git push ${useforce? "--force" : ""} heroku \`git subtree split --prefix=${appdir} ${branch}\`:refs/heads/master`
    );
  }
  
}

function addBuildpacks({buildpacks}){

  if(buildpacks){
    execComm("heroku buildpacks:clear");

    var buildpacks = JSON.parse(buildpacks);

    // Add first buildpack 
    var buildpack = buildpacks.shift();
    execComm(`heroku buildpacks:set ${buildpack}`);

    // Add anothers buildpacks
    buildpacks.forEach((bp) => {
      execComm(`heroku buildpacks:add ${bp}`);
    });

    console.log("Added buildpacks");
    
  }

}

function addDynamicFiles({ dynamicFiles }){
  if(dynamicFiles){
    execComm(`git add -A . && git commit -m "Added dynamic files"`);
    console.log("Added dynamic files");
  }
}

function addConfigs({ app_name, env_file, appdir }){
  let configVars = [];
  for (let key in process.env) {
    if (key.startsWith("HD_")) {
      configVars.push(key.substring(3) + "='" + process.env[key] + "'");
    }
  }
  if (env_file) {
    const env = fs.readFileSync(path.join(appdir, env_file), "utf8");
    const variables = require("dotenv").parse(env);
    const newVars = [];
    for (let key in variables) {
      newVars.push(key + "=" + variables[key]);
    }
    configVars = [...configVars, ...newVars];
  }
  if (configVars.length !== 0) {
    execComm(`heroku config:set --app=${app_name} ${configVars.join(" ")}`);
  }
}

function selectHerokuApp ({ app_name }) {
  try {
    execComm(`heroku git:remote --app ${app_name}`);
    console.log("Added git remote heroku");
  } catch (err) {
    execComm(`heroku create ${app_name}`);
    console.log("Successfully created a new heroku app");
  }
}

function loginHeroku(){
  execComm("heroku login");
  console.log("Successfully logged into heroku");
}

function createProcfile({ procfile, appdir }){
  if (procfile) {
    fs.writeFileSync(path.join(appdir, "Procfile"), procfile);
    execComm(`git add -A ${path.join(appdir, "Procfile")} && git commit -m 'Added Procfile'`);
    console.log("Written Procfile with custom configuration");
  }
}

function catNetrcFile({email, api_key}){
  execComm(`cat >~/.netrc <<EOF
  machine api.heroku.com
      login ${email}
      password ${api_key}
  machine git.heroku.com
      login ${email}
      password ${api_key}
  EOF`);

  console.log("Created netrc file");


}

function getInputVars(){

  let inputVars = {
      api_key: core.getInput("heroku_api_key"),
      email: core.getInput("heroku_email"),
      app_name: core.getInput("heroku_app_name"),
      buildpacks: core.getInput("buildpacks"),
      branch: core.getInput("branch"),
      useforce: core.getInput("useforce"),
      appdir: core.getInput("appdir"),
      procfile: core.getInput("procfile"),
      env_file: core.getInput("env_file"),
      dynamicFiles: core.getInput("dynamicFiles"),
  };

  console.log("Obtained input vars");

  return inputVars;

}

function execComm(comm){
  return execSync(comm, {stdio: 'inherit'});
}