const express = require('express');
const path = require('path');
const driver = require('../neo4j');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/trips', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user/trips.html'));
});








module.exports = router;