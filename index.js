const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const fileExists = require('file-exists');

const File = function (filePath = false) {
  this.file = [];
  this.archiveFile = [];
  if(filePath) {
    if(typeof filePath == 'object') {
      this.file = this.file.concat(filePath);
    } else {
      this.file.push(filePath)
    }
  }
}

File.prototype.setFile = function (filePath = false) {
  if(typeof filePath == 'object') {
    this.file = this.file.concat(filePath);
  } else {
    this.file.push(filePath)
  }
}

File.prototype.setArchiveFile = function (filePath = false) {
  if(typeof filePath == 'object') {
    this.archiveFile = this.archiveFile.concat(filePath);
  } else {
    this.archiveFile.push(filePath)
  }
}

File.prototype.setOutput = function (outputPath) {
  this.output = outputPath;
}

File.prototype.setConfig = function (opt) {
  if(opt.password) this.password = opt.password;
  if(opt.comment) this.comment = opt.comment;
  if(opt.volumes) this.volumes = opt.volumes;
  if(opt.deleteAfter) this.deleteAfter = opt.deleteAfter;
  if(opt.keepBroken) this.keepBroken = opt.keepBroken;
  if(opt.level) this.level = opt.level;

}

File.prototype.rar = function() {
  return new Promise((resolve, reject) => {
    if(!checkField([this.output, this.file])) reject(`Input and Output file are required!`)
    let command = `${__dirname}/rar a -ep `;
    if(this.password) command += `-p${this.password} `;
    if(this.volumes) command += `-v${this.volumes*1024} `;
    if(this.deleteAfter) command += `-df `;
    if(this.level) command += `-m${this.level} `;
    if(fileExists.sync(this.output)) fs.unlinkSync(this.output);
    command += `${this.output} `;
    this.file.forEach((file) => {
      if(!fileExists.sync(file)) reject(`file didn't exist: ${file}`);
      command += `${file} `;
    })
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(res);
    })
  })
}

File.prototype.unrar = function() {
  return new Promise((resolve, reject) => {
    if(!checkField([this.output, this.file])) reject(`Input and Output file are required!`)
    let command = `${__dirname}/unrar e -o+ `;
    if(this.password) command += `-p${this.password} `;
    if(this.deleteAfter) command += `-df `;
    command += `${this.file[0]} `;
    this.archiveFile.forEach((file) => {
      command += `${file} `;
    })
    command += `${this.output} `;
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(res);
    })
  })
}

File.prototype.listFile = function () {
  return new Promise((resolve, reject) => {
    let command = `${__dirname}/unrar l `;
    if(this.password) command += `-p${this.password} `;
    this.file.forEach((file) => {
      if(!fileExists.sync(file)) reject(`file didn't exist: ${file}`);
      command += `${file} `;
    })
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(parseList(res));
    })
  })
}

// // let file = new File('/home/fauzan/Documents/idleechjs/modules/utils/test.mp4');
// let file = new File('/home/fauzan/Documents/idleechjs/modules/utils/test2.rar');
// // file.setOutput('/home/fauzan/Documents/idleechjs/modules/utils/test.rar');
// file.setOutput('/home/fauzan/Documents/idleechjs/modules/utils/');
// // file.setConfig({password: 'fauzan', volumes: 10, level: 3 });
// file.setArchiveFile(['test/home/fauzan/Videos/batchUpload.mp4', 'test/home/fauzan/Videos/batchUpload2.mp4']);
// file.setConfig({password: 'fauzan'});
// file.unrar().then((res) => {
//   console.log(res);
// }).catch((err) => {
//   console.log(err);
// })

function checkField(arr) {
  let output = true;
  arr.forEach((item) => {
    if(!item || typeof item == 'undefined' || item == 'undefined') output = false;
  })
  return output;
}

function parseList(res) {
  res = res.split('----------- ---------  ---------- -----  ----')[1].trim();
  res = res.split('\n');
  let output = [];
  res.forEach((item, index) => {
    item = item.trim();
    item = item.split('  ');
    output.push({size: item[1], date: item[2], path: item[3], fileName: path.basename(item[3])});
  })
  return output;
}
