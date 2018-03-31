/*!
 * localdb v0.1
 *
 * Copyright 2018 kenshinee
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Making this world a better place, one code at a time @kenshinee
 *
 * A local file system using indexedDB. Mainly used to store large files and speeding up access
 */
 
 LocalDB = function () {
	
	var obj = {};
	
	var _DBName = "DB";
	var _DBVersion = 1.0;
	var _DBTable = "Table";	
	var db;
	
	
	
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;        

	obj.start = function(DBName, DBVersion, DBTable, callback) {	
	
		_DBName = DBName;
		_DBVersion = DBVersion;
		_DBTable = DBTable;
		
		var request = indexedDB.open(_DBName, _DBVersion),
			createObjectStore = function (dataBase) {				
				dataBase.createObjectStore(_DBTable);
			}
			
		request.onerror = function (event) {
			console.log("Error creating/accessing IndexedDB database");
		};

		request.onsuccess = function (event) {
			console.log("Success creating/accessing IndexedDB database");
			db = request.result;

			db.onerror = function (event) {
				console.log("Error creating/accessing IndexedDB database");
			};
			
			if (db.setVersion) {
				if (db.version != _DBVersion) {
					var setVersion = db.setVersion(_DBVersion);
					setVersion.onsuccess = function () {
						createObjectStore(db);
						callback();
					};
				}
				else {
					callback();
				}
			}
			else {
				callback();
			}
		}
		
		request.onupgradeneeded = function (event) {
			createObjectStore(event.target.result);
		};
	
	}

    loadFile = function (name, filename, callback) {
		var xhr = new XMLHttpRequest(),
			blob;

		xhr.open("GET", filename, true);
		xhr.responseType = "blob";

		xhr.addEventListener("load", function () {
			if (xhr.status === 200) {				
				blob = xhr.response;
				var transaction = db.transaction([_DBTable], "readwrite");
				var put = transaction.objectStore(_DBTable).put(blob, name);
				callback(blob);
			}
		}, false);
		xhr.send();
	};
		
	obj.getFile = function(name, filename, callback)  {
		var transaction = db.transaction([_DBTable], "readwrite");
		transaction.objectStore(_DBTable).get(name).onsuccess = function (event) {
			var file = event.target.result;
			var URL = window.URL || window.webkitURL;
			var fileURL = null;
			if (file) {				
				fileURL = URL.createObjectURL(File);
				callback(fileURL);
				
			} else {
				
				loadFile(name, filename, function(blob) {
					fileURL = URL.createObjectURL(blob);					
					callback(fileURL);	
				}); 			
			}
		};
		
	}
	
	return obj;
}



