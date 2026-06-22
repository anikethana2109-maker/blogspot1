const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// ─── POST /api/uploads/image ────────────────────────────────────────────────
// Upload a single image to Supabase Storage and return its URL
router.post('/image', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase storage is not configured. Please define SUPABASE_URL and SUPABASE_KEY in .env.' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const bucketName = 'blog-images';

    // Attempt to create bucket if it doesn't exist (silently catch if unauthorized or already exists)
    try {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880
      });
    } catch (e) {
      // Fail silently
    }

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error details:', error);
      return res.status(500).json({ error: `Upload failed: ${error.message}. Make sure a public bucket named 'blog-images' is created in Supabase.` });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    res.json({
      url: publicUrlData.publicUrl,
      filename: fileName,
      size: file.size,
      mimetype: file.mimetype
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
