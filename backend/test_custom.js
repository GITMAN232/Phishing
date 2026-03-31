const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // fail fast
})
.then(() => {
    console.log("SUCCESS");
    process.exit(0);
})
.catch(err => {
    const fs = require('fs');
    fs.writeFileSync('test_output.txt', err.message);
    process.exit(1);
});
