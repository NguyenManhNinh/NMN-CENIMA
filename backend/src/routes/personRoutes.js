const express = require('express');
const router = express.Router();
const {
  getActors,
  getDirectors,
  getPersonBySlug,
  getPersons,
  createPerson,
  updatePerson,
  deletePerson,
  getNationalities,
  togglePersonLike,
  incrementPersonView
} = require('../controllers/personController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/v1/persons:
 *   get:
 *     summary: Lấy danh sách tất cả người (diễn viên + đạo diễn)
 *     tags: [Persons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [actor, director, both]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -viewCount
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', getPersons);

/**
 * @swagger
 * /api/v1/persons/actors:
 *   get:
 *     summary: Lấy danh sách diễn viên
 *     tags: [Persons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/actors', getActors);

/**
 * @swagger
 * /api/v1/persons/nationalities:
 *   get:
 *     summary: Lấy danh sách quốc tịch unique của diễn viên
 *     tags: [Persons]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/nationalities', getNationalities);

/**
 * @swagger
 * /api/v1/persons/directors:
 *   get:
 *     summary: Lấy danh sách đạo diễn
 *     tags: [Persons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/directors', getDirectors);

/**
 * @swagger
 * /api/v1/persons/{slug}:
 *   get:
 *     summary: Lấy chi tiết người theo slug
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công - Trả về thông tin chi tiết + danh sách phim
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:slug', getPersonBySlug);

/**
 * @swagger
 * /api/v1/persons:
 *   post:
 *     summary: Tạo person mới (Admin)
 *     tags: [Persons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [actor, director, both]
 *               photoUrl:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               shortBio:
 *                 type: string
 *               fullBio:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', protect, restrictTo('admin'), createPerson);

/**
 * @swagger
 * /api/v1/persons/{id}:
 *   put:
 *     summary: Cập nhật person (Admin)
 *     tags: [Persons]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', protect, restrictTo('admin'), updatePerson);

/**
 * @swagger
 * /api/v1/persons/{id}:
 *   delete:
 *     summary: Xóa person (Admin)
 *     tags: [Persons]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', protect, restrictTo('admin'), deletePerson);

/**
 * @swagger
 * /api/v1/persons/{id}/like:
 *   post:
 *     summary: Toggle like cho person
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [like, unlike]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:id/like', togglePersonLike);

/**
 * @swagger
 * /api/v1/persons/{id}/view:
 *   post:
 *     summary: Tăng view count cho person
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post('/:id/view', incrementPersonView);

module.exports = router;
