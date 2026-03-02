# Alt Text and Media Transcript Strategy

## Alt Text Guidelines

### Images
- **Informative images:** Describe the content and purpose. Example: `alt="Bar chart showing 72% course completion"`
- **Decorative images:** Use `alt=""` (empty) — screen readers will skip
- **Functional images (buttons/links):** Describe the action. Example: `alt="Navigate to course page"`
- **Complex images (charts/diagrams):** Provide summary alt text + detailed description in adjacent text or `aria-describedby`

### Icons
- **Standalone icons:** Must have `aria-label` on the button/link wrapping them
- **Icons with visible text:** Use `aria-hidden="true"` on the icon element
- **Status icons:** Include text equivalent. Example: checkmark icon + "Completed" text

### User Avatars
- Use display name as alt text: `alt="Ada Learner's avatar"`
- If no image, the Avatar component renders initials (accessible by default)

## Media Transcripts

### Audio Lessons
- **Required:** Full text transcript available alongside the audio player
- **Format:** Timestamped if possible, or paragraph-form transcript
- **Implementation:** Store transcript in lesson `content` field alongside audio URL

### Video Lessons
- **Required:** Captions (at minimum) or full transcript
- **Preferred:** Both captions and a downloadable transcript
- **Implementation:** Use `<track kind="captions">` element inside video player
- **Format:** WebVTT (.vtt) caption files stored in Supabase Storage

### Interactive Content
- **Required:** Text description of the interaction's purpose and expected outcome
- **Alternative:** Non-interactive version available for users who cannot use the interactive element

## Implementation Checklist

| Content Type | Alt Text | Transcript | Captions | Tested |
|-------------|:---:|:---:|:---:|:---:|
| Course thumbnails | Required | — | — | Manual |
| Lesson images | Required | — | — | Manual |
| Audio lessons | — | Required | — | Manual |
| Video lessons | — | Recommended | Required | Manual |
| Quiz images | Required | — | — | Manual |
| Charts/graphs | Required + description | — | — | Manual |
| Decorative elements | `alt=""` | — | — | Automated |

## Automated Checks
- ESLint `jsx-a11y/alt-text` rule enforces alt text on all `<img>` elements
- Build fails if alt text is missing from image elements
- Manual review required for alt text quality (automated checks only verify presence)
