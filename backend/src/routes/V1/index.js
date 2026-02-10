const express = require('express');
const authRoute = require('./authRoutes');
const userRoute = require('./userRoutes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/cinemas',
    route: require('./cinemaRoutes')
  },
  {
    path: '/rooms',
    route: require('./roomRoutes')
  },
  {
    path: '/movies',
    route: require('./movieRoutes')
  },
  {
    path: '/genres',
    route: require('../genreRoutes')
  },
  {
    path: '/persons',
    route: require('../personRoutes')
  },
  {
    path: '/showtimes',
    route: require('./showtimeRoutes')
  },
  {
    path: '/holds',
    route: require('./seatHoldRoutes')
  },
  {
    path: '/orders',
    route: require('./orderRoutes')
  },
  {
    path: '/payments',
    route: require('./paymentRoutes')
  },
  {
    path: '/checkin',
    route: require('./checkinRoutes')
  },
  {
    path: '/cms',
    route: require('./cmsRoutes')
  },
  {
    path: '/vouchers',
    route: require('./voucherRoutes')
  },
  {
    path: '/reviews',
    route: require('./reviewRoutes')
  },
  {
    path: '/combos',
    route: require('./comboRoutes')
  },
  {
    path: '/reports',
    route: require('./reportRoutes')
  },
  {
    path: '/tickets',
    route: require('./ticketRoutes')
  },
  {
    path: '/loyalty',
    route: require('./loyaltyRoutes')
  },
  {
    path: '/chatbot',
    route: require('./chatbotRoutes')
  },
  {
    path: '/feedbacks',
    route: require('./feedbackRoutes')
  },
  {
    path: '/faqs',
    route: require('./faqRoutes')
  },
  {
    path: '/admin/reports',
    route: require('./adminReportRoutes')
  },
  {
    path: '/promotions',
    route: require('./promotionRoutes')
  },
  {
    path: '/featured',
    route: require('../featuredRoutes')
  },
  {
    path: '/ticket-pricing',
    route: require('./ticketPricingRoutes')
  },
  {
    path: '/membership-info',
    route: require('./membershipInfoRoutes')
  }
];

defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

module.exports = router;
