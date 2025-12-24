const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: String,
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  category: {
    type: String,
    enum: ['NEWS', 'REVIEW', 'PROMOTION'],
    default: 'NEWS'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  publishedAt: Date,
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

articleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, locale: 'vi' });
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
