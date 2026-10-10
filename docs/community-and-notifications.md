# Community & Notifications Module (`COM-*`, `NTF-*`)

## 1. Purpose
The Community & Notifications module delivers interactive social learning workflows: review eligibility gating ($\ge 10\%$ progress threshold), denormalized rating caching, rating distribution summaries, single instructor public review replies, lecture-level and course-level Q&A discussion forums with upvoting and best-answer selection, moderation flag/report intake, throttled direct messaging between students and instructors, and user multichannel notification preferences.

---

## 2. Endpoints Table

### Reviews & Ratings
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/courses/{courseSlug}/reviews` | Public reviews listing with rating breakdown distribution (1-5 stars) | Public |
| `POST` | `/api/v1/courses/{courseSlug}/reviews` | Enrolled learner post/update review (enforces $\ge 10\%$ progress) | Bearer / Cookie |
| `DELETE` | `/api/v1/reviews/{reviewUlid}` | Delete own review (triggers course rating recalculation) | Bearer / Cookie |
| `POST` | `/api/v1/reviews/{reviewUlid}/reply` | Instructor post single public reply to review | Bearer / Cookie |

### Q&A Forums
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/courses/{courseSlug}/qa` | List questions (filter by lecture, sort by newest or popular) | Public |
| `POST` | `/api/v1/courses/{courseSlug}/qa` | Ask a new question | Bearer / Cookie |
| `GET` | `/api/v1/qa/questions/{questionUlid}/answers` | List answers for a question | Public |
| `POST` | `/api/v1/qa/questions/{questionUlid}/answers` | Post answer (auto-marks instructor replies) | Bearer / Cookie |
| `POST` | `/api/v1/qa/questions/{questionUlid}/upvote` | Upvote or un-upvote question | Bearer / Cookie |
| `POST` | `/api/v1/qa/answers/{answerUlid}/upvote` | Upvote or un-upvote answer | Bearer / Cookie |
| `POST` | `/api/v1/qa/answers/{answerUlid}/best-answer` | Mark best answer (resolves question) | Bearer / Cookie |

### Moderation & Direct Messages
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/moderation/reports` | Flag review, question, answer, or message for moderation | Bearer / Cookie |
| `GET` | `/api/v1/messages` | List active direct message threads | Bearer / Cookie |
| `GET` | `/api/v1/messages/{partnerUlid}` | Read message thread with partner (marks messages read) | Bearer / Cookie |
| `POST` | `/api/v1/messages/{recipientUlid}` | Send direct message (throttled) | Bearer / Cookie |

### Notifications & Preferences
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | List user in-app notifications with unread count | Bearer / Cookie |
| `POST` | `/api/v1/notifications/{id}/read` | Mark single notification as read | Bearer / Cookie |
| `POST` | `/api/v1/notifications/read-all` | Mark all notifications read | Bearer / Cookie |
| `GET` | `/api/v1/notifications/preferences` | Retrieve user notification preferences | Bearer / Cookie |
| `PUT` | `/api/v1/notifications/preferences` | Update category and channel enablement | Bearer / Cookie |

---

## 3. Business Rules Implemented
- **Review Eligibility (`COM-01`):** Requires verified enrollment and $\ge 10\%$ course progress.
- **Denormalized Course Rating (`COM-03`):** Every review creation, edit, or deletion recalculates `courses.rating_cache` and `courses.reviews_count` inside a database transaction.
- **Single Instructor Reply (`COM-02`):** Only the course's primary instructor may reply, and at most one reply can be submitted per review.
- **Best Answer Authorization (`COM-04`):** Only the question author or the course instructor can accept an answer as the best answer.
