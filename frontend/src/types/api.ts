export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    [key: string]: unknown;
  };
  message?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    correlation_id?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  headline?: string | null;
  bio?: string | null;
  roles?: Array<{ id: number; name: string }>;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  mfa_enabled?: boolean;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  price_amount: number;
  price_currency: string;
  is_free: boolean;
  rating: number;
  reviews_count: number;
  enrollments_count: number;
  total_duration_seconds: number;
  lectures_count: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  instructor?: {
    name: string;
    avatar_url?: string | null;
    headline?: string | null;
  };
  sections?: Section[];
}

export interface Section {
  id: string;
  title: string;
  sort_order: number;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  title: string;
  lecture_type: 'video' | 'article' | 'quiz' | 'assignment' | 'resource';
  duration_seconds: number;
  is_free_preview: boolean;
  sort_order: number;
}

export interface CartItem {
  id: string;
  course_id: string;
  course: Course;
  price_amount: number;
}

export interface Cart {
  items: CartItem[];
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  coupon_code?: string | null;
}

export interface Enrollment {
  id: string;
  course_id: string;
  course: Course;
  progress_percent: number;
  status: 'active' | 'completed' | 'revoked';
  last_lecture_id?: string | null;
  enrolled_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  courses_count?: number;
  parent_id?: string | null;
  children?: Category[];
}

export interface Review {
  id: string;
  course_id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
  rating: number;
  comment: string;
  created_at: string;
  instructor_reply?: {
    comment: string;
    created_at: string;
  } | null;
}

export interface RatingBreakdown {
  average_rating: number;
  total_reviews: number;
  distribution: {
    [star: number]: {
      count: number;
      percentage: number;
    };
  };
}

export interface InstructorProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  headline?: string | null;
  bio?: string | null;
  rating: number;
  reviews_count: number;
  students_count: number;
  courses_count: number;
  courses?: Course[];
}
