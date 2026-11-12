import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Course from '../models/Course.js';
import Product from '../models/Product.js';
import Innovation from '../models/Innovation.js';
import env from '../config/env.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND = path.resolve(__dirname, '..', '..', 'frontend');

function injectSEO(res, file, data) {
  const filePath = path.join(FRONTEND, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const canonical = `${env.appUrl}${data.url}`;
  const ogImage = data.image || `${env.appUrl}/assets/og-image.jpg`;

  // Basic SEO
  html = html.replace('<title>OpenTech</title>', `<title>${data.title} — OpenTech</title>`);
  html = html.replace('<meta name="description" content="">', `<meta name="description" content="${data.description}">`);
  html = html.replace('<link rel="canonical" href="">', `<link rel="canonical" href="${canonical}">`);
  
  // Open Graph
  html = html.replace('<meta property="og:title" content="">', `<meta property="og:title" content="${data.title}">`);
  html = html.replace('<meta property="og:description" content="">', `<meta property="og:description" content="${data.description}">`);
  html = html.replace('<meta property="og:image" content="">', `<meta property="og:image" content="${ogImage}">`);
  html = html.replace('<meta property="og:url" content="">', `<meta property="og:url" content="${canonical}">`);
  html = html.replace('<meta property="og:type" content="">', `<meta property="og:type" content="website">`);

  // Twitter Card
  html = html.replace('<meta name="twitter:card" content="">', `<meta name="twitter:card" content="summary_large_image">`);
  html = html.replace('<meta name="twitter:title" content="">', `<meta name="twitter:title" content="${data.title}">`);
  html = html.replace('<meta name="twitter:description" content="">', `<meta name="twitter:description" content="${data.description}">`);
  html = html.replace('<meta name="twitter:image" content="">', `<meta name="twitter:image" content="${ogImage}">`);

  // JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": data.type,
    "name": data.title,
    "description": data.description,
    "image": ogImage,
    "url": canonical
  };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);

  res.send(html);
}

router.get('/course/:slug', async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) return res.status(404).send('Not found');
    injectSEO(res, 'course.html', {
      title: course.title.en || course.title.ha,
      description: course.description.en || course.description.ha,
      image: course.image,
      url: `/course/${course.slug}`,
      type: 'Course'
    });
  } catch (err) { next(err); }
});

router.get('/product/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).send('Not found');
    injectSEO(res, 'product.html', {
      title: product.name.en || product.name.ha,
      description: product.description.en || product.description.ha,
      image: product.image,
      url: `/product/${product.slug}`,
      type: 'Product'
    });
  } catch (err) { next(err); }
});

router.get('/project/:slug', async (req, res, next) => {
  try {
    const project = await Innovation.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).send('Not found');
    injectSEO(res, 'project.html', {
      title: project.title.en || project.title.ha,
      description: project.description.en || project.description.ha,
      image: project.image,
      url: `/project/${project.slug}`,
      type: 'CreativeWork'
    });
  } catch (err) { next(err); }
});

export default router;
