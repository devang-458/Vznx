const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    searchTasks,
    getFilterOptions,
    searchUsers,
    getQuickFilters
} = require("../controller/searchFilterController");

const router = express.Router();

router.get("/tasks", protect, searchTasks);
router.get("/filter-options", protect, getFilterOptions);
router.get("/users", protect, adminOnly, searchUsers);
router.get("/quick-filters", protect, getQuickFilters);

module.exports = router;
