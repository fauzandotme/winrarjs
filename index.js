const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const fileExists = require('file-exists');
const mime = require('mime');

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

File.prototype.addFile = function (filePath = false) {
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
    if(mime.lookup(this.file[0]) != 'application/x-rar-compressed') reject({message: `Please select rar file`});
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
      resolve(parseUnrar(res));
    })
  })
}

File.prototype.listFile = function () {
  return new Promise((resolve, reject) => {
    let command = `${__dirname}/unrar l `;
    if(this.password) command += `-p${this.password} `;
    this.file.forEach((file) => {
      if(mime.lookup(file) != 'application/x-rar-compressed') {reject({message: `Please select rar file`}); throw 'err'}
      if(!fileExists.sync(file)) {reject(`file didn't exist: ${file}`); throw 'err'}
      command += `${file} `;
    })
    exec(command,{maxBuffer: 1024 * 5000}, (err, res) => {
      if(err) reject(err);
      resolve(parseList(res));
    })
  })
}

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
    item = item.replace(/\s\s+/g, ' ').split(' ');
    output.push({size: item[1], date: item[2] + ' ' + item[3], path: item[4], fileName: path.basename(item[4])});
  })
  return output;
}

function parseUnrar(res) {
  res = res.match(/Extracting +.+OK/g);
  let output = [];
  res.forEach((item) => {
    let filePath = item.replace('Extracting', '').replace(/\s\s\s+.+/g, '').trim();
    output.push({fileName: path.basename(filePath), filePath});
  })
  return output;
}

module.exports = File;
