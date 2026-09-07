DELIVERABLES — GALLERY UPLOAD FOLDER
====================================

Drop each shoot's photos in ITS OWN subfolder named the gallery slug.

    deliverables/john-graduation/   <- put a shoot's photos here
    deliverables/priya-events/      <- another shoot, its own folder

Then run the upload from inside the "portfolio" folder:

    node scripts/r2-upload.mjs <slug>

Replace <slug> with the folder name (letters, numbers, and dashes).
The script:
  - uploads the originals + webp previews to Cloudflare R2
  - creates content/galleries/<slug>/gallery.json
  - prints the generated client password (LUMEN-XXXX...)

Example:

    node scripts/r2-upload.mjs john-graduation

After the upload (optional): edit content/galleries/<slug>/gallery.json
to set the title, category, location. Then commit + push to deploy:

    git add content/galleries/<slug>
    git commit -m "gallery: <slug>"
    git push

NOTE: everything in this folder is git-ignored (see .gitignore). Your
source photos are never committed to the repo — only uploaded to R2.