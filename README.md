# Plan Navigator
1. Put these files in a GitHub repo (connect it in Netlify) or drag the folder into Netlify Drop. No build command; publish dir is `.`.
2. Site settings > Environment variables: add `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`, default `claude-sonnet-5-5`).
3. Redeploy so the function sees the variables.
4. Open the HTTPS URL on your phone (Netlify serves HTTPS automatically, which motion/compass sensors require). Tap "Enable sensors" and test.
5. Install: iOS Safari > Share > Add to Home Screen. Android Chrome > menu > Install app.

Notes: AI detection needs internet; the local fallback works offline. Netlify's ~10 s function limit is why the image is downscaled to 1600 px and the function times out at 9 s (use Retry).
