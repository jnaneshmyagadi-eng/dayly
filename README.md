# DAYLY — Know what matters today

Personal daily information platform.

## Production

- URL: https://dayly-nu.vercel.app
- Vercel project: `dayly`

## Live data

| Domain   | Provider              | Key required |
|----------|-----------------------|--------------|
| Weather  | Open-Meteo            | No           |
| Currency | Frankfurter / ECB     | No           |
| News     | GNews (optional)      | NEWS_API_KEY |
| Jobs     | Optional              | JOBS_API_KEY |

## Environment

```
NEXT_PUBLIC_SITE_URL=https://dayly-nu.vercel.app
NEWS_API_KEY=
JOBS_API_KEY=
NEXT_PUBLIC_ANALYTICS_ID=
```

## Google Search Console

1. Add property: https://dayly-nu.vercel.app
2. Verify ownership
3. Submit sitemap: https://dayly-nu.vercel.app/sitemap.xml
4. Request homepage indexing
5. Monitor Coverage and Core Web Vitals
