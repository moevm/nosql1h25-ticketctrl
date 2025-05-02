const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcrypt');

const router = express.Router();


router.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/account.html'));
});


module.exports = router;