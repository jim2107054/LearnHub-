import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface LearnCourseRedirectProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function LearnCourseRedirect({ params }: LearnCourseRedirectProps) {
  const { courseSlug } = await params;

  try {
    const res = await fetch(`${API_BASE}/catalog/courses/${courseSlug}`);
    if (res.ok) {
      const json = await res.json();
      const firstLectureId = json.data?.sections?.[0]?.lectures?.[0]?.id;
      if (firstLectureId) {
        redirect(`/learn/${courseSlug}/${firstLectureId}`);
      }
    }
  } catch {
    // Fallback
  }

  redirect(`/learn/${courseSlug}/lec_1`);
}
