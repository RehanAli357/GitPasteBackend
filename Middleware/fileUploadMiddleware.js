const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now())
    }
})

const upload = multer({ storage: storage })

module.exports = upload