WinrarJs
===================

##How to Use?
    const Winrar = require('winrarjs');

###Create rar file

    var winrar = new Winrar('/path/to/file/test.txt');
    // add another files
    winrar.addFile('/path/to/file/test2.txt');

    // add multiple file
    winrar.addFile(['/path/to/file/test2.txt', '/path/to/file/test2.txt']);

    // set output file
    winrar.setOutput('/path/to/output/output.rar');

    // set options
    winrar.setConfig({
    	password: 'testPassword',
    	comment: 'rar comment',
    	volumes: '10',  // split volumes in Mega Byte
    	deleteAfter: false, // delete file after rar proccess completed
    	level: 0 // compression level 0 - 5
    });

    // archiving file
    winrar.rar().then((result) => {
    	console.log(result);
    }).catch((err) => {
    	console.log(err);
    }

###Read rar file

    var winrar = new Winrar('/path/to/file/test.rar');

    // Read rar files
    winrar.listFile().then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    }

###Extract rar archive

        var winrar = new Winrar('/path/to/file/test.txt');

        // set output folder
        winrar.setOutput('/path/to/output/folder');

        // set list of files in rar file that you wan't to extract
        winrar.setArchiveFile(['file1.txt', 'file2.txt', 'folder/file1.txt']);

        //or
        winrar.setArchiveFile('file1.txt');

        // set options
        winrar.setConfig({
        	password: 'rarPassword',
        	deleteAfter: false, // delete file after file extracted
        	keepBroken: true, //keep broken files
        });

        // extracting files
        winrar.unrar().then((result) => {
        	console.log(result);
        }).catch((err) => {
        	console.log(err);
        }

##Contact Me
[fb.com/fauzan.tolis](https://fb.com/fauzan.tolis)
