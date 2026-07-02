const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Initialize Supabase Client with service role key for storage access
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
}) : null;

const BUCKET_NAME = 'blog-images';

// Ensure the bucket exists and is public
async function ensureBucket() {
  if (!supabase) return false;
  try {
    // Check if bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      });
      if (error) {
        console.error('Failed to create bucket:', error.message);
        return false;
      }
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
    }
    return true;
  } catch (e) {
    console.error('ensureBucket error:', e.message);
    return false;
  }
}

// ─── POST /api/uploads/image ────────────────────────────────────────────────
router.post('/image', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase storage is not configured. Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env vars.' });
    }

    // Ensure bucket exists before uploading
    const bucketReady = await ensureBucket();
    if (!bucketReady) {
      return res.status(500).json({ error: `Storage bucket '${BUCKET_NAME}' is not accessible. Please create it in your Supabase dashboard under Storage.` });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: `Upload failed: ${error.message}` });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
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
