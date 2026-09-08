# Third-party notes

No external source code copied or adapted into feature components. Reference ideas are recorded in UI_REBASE_R1_REFERENCE_STUDY.md. react-resizable-panels is an npm dependency under MIT, bundled locally with its license retained in node_modules/react-resizable-panels/LICENSE.md. No Origin UI or Sunumatik code/assets reused. No Qt, Tailwind, shadcn kit, Motion engine, chart framework or runtime CDN introduced.

The complete new dependency notice is distributed in public/R1_THIRD_PARTY_NOTICES.txt (Vite/Tauri local asset) and artifacts/R1_THIRD_PARTY_NOTICES.txt beside the executable. License text is copied verbatim; no upstream feature source is vendored. The final production JS bundle increase is approximately 39.74kB minified / 13.30kB gzip versus the historical V2 report, including all R1 application changes. This is not an isolated package-size measurement. npm reported zero vulnerabilities after installation.
