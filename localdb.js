LocalDB = function () {
	
	var obj = {};
	
	var _DBName = "shipDB10";
	var _DBVersion = 1.0;
	var _DBTable = "ships";	
	var db;
	
	
	
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;        

	obj.start = function(DBName, DBVersion, DBTable, callback) {	
	
		_DBName = DBName;
		_DBVersion = DBVersion;
		_DBTable = DBTable;
		
		var request = indexedDB.open(_DBName, _DBVersion),
			createObjectStore = function (dataBase) {
				console.log("Creating objectStore")
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
				console.log("Image retrieved");
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
			var imgFile = event.target.result;
			var URL = window.URL || window.webkitURL;
			var imgURL = null;
			if (imgFile) {
				
				imgURL = URL.createObjectURL(imgFile);
				console.log("loading from database");
				callback(imgURL);
				
			} else {
				
				loadFile(name, filename, function(blob) {
					imgURL = URL.createObjectURL(blob);
					console.log("loading from server");
					callback(imgURL);	
				}); 			
			}
		};
		
	}
	
	return obj;
}



