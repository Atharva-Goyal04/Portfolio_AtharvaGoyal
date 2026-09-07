DELIVERABLES — GALLERY UPLOAD FOLDER
====================================

Drop each shoot's photos in ITS OWN subfolder named the gallery slug.

    deliverables/john-graduation/   <- put a shoot's photos here
    deliverables/priya-events/      <- another shoot, its own folder

Then run the upload from inside the "portfolio" folder:

    node scripts/r2-upload.mjs <slug> [--client "Name"] [--email x@y.com]
                                    [--phone 555-0100] [--status delivered]
                                    [--notes "free text"]

Replace <slug> with the folder name (letters, numbers, and dashes).
The script:
  - uploads the originals + webp previews to Cloudflare R2
  - creates content/galleries/<slug>/gallery.json
  - prints the generated client password (LUMEN-XXXX...)
  - adds/updates a client card in deliverables/clients.html (open it in a
    browser — shows client, contact, status pill, gallery link, password,
    and notes)

After uploading it ASKS for client name, email, phone, status, and notes —
just press Enter to leave any field unchanged. You can skip the questions
by passing --flags, and values already in the card are reused on re-runs.
Each gallery gets its own card in the SAME clients.html file.

To update a card WITHOUT re-uploading photos (e.g. after a session, to
change the status or add notes):

    node scripts/r2-upload.mjs <slug> --refresh

Example:

    node scripts/r2-upload.mjs john-graduation --client "John Doe" --status delivered

After the upload (optional): edit content/galleries/<slug>/gallery.json
to set the title, category, location. Then commit + push to deploy:

    git add content/galleries/<slug>
    git commit -m "gallery: <slug>"
    git push

NOTE: everything in this folder is git-ignored (see .gitignore). Your
source photos are never committed to the repo — only uploaded to R2.