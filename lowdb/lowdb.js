const FileSync = require('lowdb/adapters/FileSync');
const low = require('lowdb');

// CONFIG
const adapter = new FileSync('db.json');
const db = low(adapter);

module.exports = db;

// If the users object doesnt exist set it to an empty array.
if (!db.has('users').value()) {
    db.set('users', [
        {
            email: 'web@dwjproduction.com',
            password: "",
            admin: true
        }
    ]).write();
}