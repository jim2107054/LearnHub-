# Instructor Studio & Media Module (`INS-*`)

## 1. Purpose
The Instructor Studio & Media module allows educators to create, structure, price, and publish courses; manage promotions and coupons; and upload high-definition video assets directly to S3 with adaptive bitrate HLS transcoding.

---

## 2. Endpoints Table

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/instructor/onboard` | Join the instructor program | Bearer / Cookie |
| `GET` | `/api/v1/instructor/courses` | List courses authored by current instructor | Bearer / Cookie |
| `POST` | `/api/v1/instructor/courses` | Create new course draft | Bearer / Cookie |
| `PATCH` | `/api/v1/instructor/courses/{courseUlid}` | Update course metadata, price, objectives | Bearer / Cookie |
| `DELETE` | `/api/v1/instructor/courses/{courseUlid}` | Delete course (blocked if enrollments exist) | Bearer / Cookie |
| `GET` | `/api/v1/instructor/courses/{courseUlid}/validate` | Run pre-publish quality checklist (`BR-03`) | Bearer / Cookie |
| `POST` | `/api/v1/instructor/courses/{courseUlid}/submit-review` | Submit course into moderation review queue | Bearer / Cookie |
| `POST` | `/api/v1/instructor/courses/{courseUlid}/sections` | Create curriculum section | Bearer / Cookie |
| `POST` | `/api/v1/instructor/courses/{courseUlid}/sections/{sectionUlid}/lectures` | Create lecture | Bearer / Cookie |
| `POST` | `/api/v1/instructor/courses/{courseUlid}/curriculum/reorder` | Reorder sections & lectures transactionally | Bearer / Cookie |
| `GET` | `/api/v1/instructor/coupons` | List instructor's active coupons | Bearer / Cookie |
| `POST` | `/api/v1/instructor/coupons` | Create course or instructor discount coupon | Bearer / Cookie |
| `POST` | `/api/v1/instructor/media/multipart/initiate` | Generate S3 presigned multipart upload URLs | Bearer / Cookie |
| `POST` | `/api/v1/instructor/media/multipart/complete` | Finalize upload & dispatch transcoding job | Bearer / Cookie |
| `POST` | `/api/v1/media/transcode/webhook` | Webhook callback from transcoding pipeline | Webhook Signature |

---

## 3. State Machines

### Course Status Machine
```
draft ──► in_review ──► approved ──► published ──► archived
               │           │            │
               ▼           ▼            ▼
            rejected     draft        draft (unpublish)
```

### MediaAsset State Machine
```
uploading ──► uploaded ──► scanning ──► transcoding ──► ready
                                             │
                                             ▼
                                           failed
```

---

## 4. Pre-Publish Validation Checklist (`BR-03`, `INS-10`)
Before submission to the moderation queue, the course must satisfy:
1. At least 1 curriculum section.
2. At least 5 lectures.
3. At least 30 minutes total video duration.
4. Promotional thumbnail present.
5. Subtitle present.
6. At least 4 learning objectives defined in `what_you_will_learn`.
