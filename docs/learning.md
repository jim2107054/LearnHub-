# Learning Experience Module (`LRN-*`)

## 1. Purpose
The Learning Experience module powers active course consumption ("My Learning"), streaming authorization with short-lived expiring CDN signed URLs, video heartbeat progress tracking, the $\ge 90\%$ completion threshold rule, concurrent stream controls (`LRN-12`), and timestamped learning notes.

---

## 2. Endpoints Table

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/learning/enrollments` | Enrolled courses with completion percentage and resume lecture | Bearer / Cookie |
| `GET` | `/api/v1/learning/courses/{courseUlid}/lectures/{lectureUlid}` | Access lecture (checks enrollment/preview, returns signed HLS URL) | Bearer / Cookie |
| `POST` | `/api/v1/learning/courses/{courseUlid}/lectures/{lectureUlid}/progress` | Heartbeat progress upsert & completion evaluation | Bearer / Cookie |
| `GET` | `/api/v1/learning/lectures/{lectureUlid}/notes` | List learner's timestamped notes for this lecture | Bearer / Cookie |
| `POST` | `/api/v1/learning/lectures/{lectureUlid}/notes` | Create timestamped bookmark/note during video playback | Bearer / Cookie |
| `DELETE` | `/api/v1/learning/notes/{noteUlid}` | Delete a learning note | Bearer / Cookie |

---

## 3. Video Security & Concurrent Stream Limiter (`LRN-12`)
- Raw S3 buckets and media keys are strictly private.
- Video playback URLs are issued dynamically as signed URLs expiring in 120 minutes.
- Active playback sessions are tracked in Redis (`active_streams:{userId}`). If concurrent active playback sessions exceed the platform limit (default: 3), the request is rejected with HTTP `429` (`concurrent_stream_limit_exceeded`).

---

## 4. Completion Rules
- Video lectures: Marked completed when student reaches $\ge 90\%$ of total lecture duration (`duration_seconds`).
- Articles/Resources: Can be marked complete manually via the progress endpoint.
- Course Completion: Recomputed as $\text{round}\left(\frac{\text{completed lectures}}{\text{total lectures}} \times 100\right)\%$. When $100\%$ is attained, `enrollments.status = 'completed'` and `CourseCompleted` is dispatched (triggering certificate generation in Phase 6).
