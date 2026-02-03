# [ ] Fix the admin review section

## Description
Improve the admin dashboard + review workflow and clean up the review UI.

## Requirements
- Friendly URLs:
  - In `/admin/dashboard` (Pending Documents list), clicking a document should navigate to a friendly route like `/admin/review/$slug` (instead of `admin/review?doc=<id>`).
- Review page structure:
  - On `/admin/review/$slug`, remove the extra "Pending Review" section from the main content area.
  - Keep the review actions panel and the selected document's content/details.
  - If the user visits `/admin/review` without a selected document, redirect to `/admin`.
- Filters + search:
  - Add a filter to switch between `Pending`, `Published`, and `All`.
  - Add a search input (e.g. by title/slug).
  - Fix the actual implementation because when I type in the input field its not fliendly because the hidratation or the cordination with the url delete when type fast
- Published document behavior:
  - If a published document is selected, do not allow Approve/Reject.
  - Instead, show an action like "Move back to pending" that changes the document status from published to pending.
- Context in the review panel:
  - Above the Review Actions component, show the document cover and the document prompt/description.
- View the correct implementation because the actual dont work properly.
