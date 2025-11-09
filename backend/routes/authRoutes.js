const { Router } = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../controller/authController.js");
const { protect } = require("../middleware/authMiddleware.js")
const upload = require("../middleware/uploadMiddleware.js")

const router = Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)

router.post("/upload-image", upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded'
        })
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/upload/${req.file.filename}`

    res.status(200).json({ imageUrl })
})

module.exports = router;