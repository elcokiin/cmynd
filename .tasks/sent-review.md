# [ ] Require a cover before sending a document to review (and improve cards)

## Description
Improve the "send to review" experience by making the cover required, refining the settings dialog UX, and updating document cards.

## Requirements
- Settings dialog navigation:
  - Update the settings dialog to include a sidebar navigation with:
    - Cover (default view)
    - Curate (show "This feature is still being built.")
    - References (show "This feature is still being built.")
- Cover requirement:
  - A cover is required before changing status from "building" to "pending".
  - Validate this and block the action with a clear error message if the cover is missing.
- Document cards:
  - Refactor document cards to improve styling (use the "elcokiin-before-blog" cards as inspiration).
  - Provide two variants:
    - Card without a cover (fallback layout)
    - Card with a cover image
- Refining the settings dialog UX
  - Make a sidebar (without trigger) inside the settings dialog
    - Split the Cover config and the type of document in differents items in the sidebar
