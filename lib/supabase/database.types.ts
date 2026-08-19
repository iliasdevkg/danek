/**
 * Типы схемы Postgres. Поддерживаются вручную вместе с supabase/migrations/*.sql
 * и перегенерируются командой:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Домены i18n_text / i18n_required из миграции 0002. */
export type I18nText = { ky: string; ru: string; en: string };

export type AppRole = "admin" | "manager" | "teacher" | "parent" | "student";
export type LocaleCode = "ky" | "ru" | "en";
export type TuitionPeriod = "monthly" | "quarterly" | "yearly";
export type ApplicationStatus =
  | "new"
  | "contacted"
  | "trial_scheduled"
  | "trial_done"
  | "accepted"
  | "enrolled"
  | "rejected"
  | "lost";
export type ApplicationSource =
  "website" | "instagram" | "facebook" | "whatsapp" | "referral" | "walk_in" | "phone" | "other";
export type StudentStatus = "active" | "graduated" | "expelled" | "academic_leave";
export type GuardianRelation =
  "mother" | "father" | "grandmother" | "grandfather" | "guardian" | "other";
export type ApplicationEventType =
  "note" | "call" | "status_change" | "message" | "trial_scheduled";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type GradeKind = "lesson" | "homework" | "test" | "term" | "exam";
export type InvoiceStatus = "open" | "partially_paid" | "paid" | "cancelled";
export type PaymentMethod = "bank_transfer" | "qr" | "cash" | "card";
export type PaymentStatus = "pending" | "confirmed" | "rejected";
export type AnnouncementAudience = "all" | "staff" | "parents" | "teachers" | "class";
export type NotificationChannel = "whatsapp" | "email" | "in_app";
export type NotificationStatus = "queued" | "sent" | "failed";

type Timestamps = { created_at: string; updated_at: string };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Timestamps & {
          id: string;
          role: AppRole;
          full_name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          locale: LocaleCode;
          is_active: boolean;
        };
        Insert: Partial<Timestamps> & {
          id: string;
          role?: AppRole;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          locale?: LocaleCode;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      site_settings: {
        Row: {
          key: string;
          value: Json;
          is_public: boolean;
          description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          is_public?: boolean;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };

      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          diff: Json | null;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          diff?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };

      academic_years: {
        Row: Timestamps & {
          id: string;
          name: string;
          starts_on: string;
          ends_on: string;
          is_current: boolean;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          name: string;
          starts_on: string;
          ends_on: string;
          is_current?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["academic_years"]["Insert"]>;
        Relationships: [];
      };

      subjects: {
        Row: Timestamps & {
          id: string;
          code: string;
          name: I18nText;
          color: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          code: string;
          name: I18nText;
          color?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
        Relationships: [];
      };

      teachers: {
        Row: Timestamps & {
          id: string;
          profile_id: string | null;
          slug: string;
          full_name: string;
          position: I18nText;
          bio: I18nText;
          photo_path: string | null;
          teaching_since: string | null;
          education: I18nText;
          is_public: boolean;
          is_active: boolean;
          sort_order: number;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          profile_id?: string | null;
          slug: string;
          full_name: string;
          position: I18nText;
          bio?: I18nText;
          photo_path?: string | null;
          teaching_since?: string | null;
          education?: I18nText;
          is_public?: boolean;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["teachers"]["Insert"]>;
        Relationships: [];
      };

      teacher_subjects: {
        Row: { teacher_id: string; subject_id: string };
        Insert: { teacher_id: string; subject_id: string };
        Update: Partial<{ teacher_id: string; subject_id: string }>;
        Relationships: [];
      };

      news: {
        Row: Timestamps & {
          id: string;
          slug: string;
          title: I18nText;
          excerpt: I18nText;
          body: I18nText;
          cover_path: string | null;
          published_at: string | null;
          is_published: boolean;
          author_id: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          slug: string;
          title: I18nText;
          excerpt?: I18nText;
          body?: I18nText;
          cover_path?: string | null;
          published_at?: string | null;
          is_published?: boolean;
          author_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["news"]["Insert"]>;
        Relationships: [];
      };

      gallery_albums: {
        Row: Timestamps & {
          id: string;
          slug: string;
          title: I18nText;
          description: I18nText;
          cover_path: string | null;
          happened_on: string | null;
          is_published: boolean;
          sort_order: number;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          slug: string;
          title: I18nText;
          description?: I18nText;
          cover_path?: string | null;
          happened_on?: string | null;
          is_published?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_albums"]["Insert"]>;
        Relationships: [];
      };

      gallery_photos: {
        Row: {
          id: string;
          album_id: string;
          path: string;
          alt: I18nText;
          width: number | null;
          height: number | null;
          blur_data: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          path: string;
          alt?: I18nText;
          width?: number | null;
          height?: number | null;
          blur_data?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_photos"]["Insert"]>;
        Relationships: [];
      };

      tuition_plans: {
        Row: Timestamps & {
          id: string;
          academic_year_id: string;
          name: I18nText;
          note: I18nText;
          grade_from: number;
          grade_to: number;
          amount_kgs: number;
          period: TuitionPeriod;
          is_public: boolean;
          sort_order: number;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          academic_year_id: string;
          name: I18nText;
          note?: I18nText;
          grade_from: number;
          grade_to: number;
          amount_kgs: number;
          period?: TuitionPeriod;
          is_public?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["tuition_plans"]["Insert"]>;
        Relationships: [];
      };

      applications: {
        Row: Timestamps & {
          id: string;
          status: ApplicationStatus;
          source: ApplicationSource;
          child_name: string;
          child_birth_date: string | null;
          grade_level: number | null;
          parent_name: string;
          parent_phone: string;
          parent_email: string | null;
          message: string | null;
          assigned_to: string | null;
          trial_at: string | null;
          student_id: string | null;
          rejection_reason: string | null;
          locale: LocaleCode;
          utm: Json;
          referrer: string | null;
          submitted_ip: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          status?: ApplicationStatus;
          source?: ApplicationSource;
          child_name: string;
          child_birth_date?: string | null;
          grade_level?: number | null;
          parent_name: string;
          parent_phone: string;
          parent_email?: string | null;
          message?: string | null;
          assigned_to?: string | null;
          trial_at?: string | null;
          student_id?: string | null;
          rejection_reason?: string | null;
          locale?: LocaleCode;
          utm?: Json;
          referrer?: string | null;
          submitted_ip?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [];
      };

      application_events: {
        Row: {
          id: string;
          application_id: string;
          type: ApplicationEventType;
          body: string | null;
          from_status: ApplicationStatus | null;
          to_status: ApplicationStatus | null;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          type?: ApplicationEventType;
          body?: string | null;
          from_status?: ApplicationStatus | null;
          to_status?: ApplicationStatus | null;
          author_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["application_events"]["Insert"]>;
        Relationships: [];
      };

      classes: {
        Row: Timestamps & {
          id: string;
          academic_year_id: string;
          grade_level: number;
          letter: string;
          homeroom_teacher_id: string | null;
          capacity: number;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          academic_year_id: string;
          grade_level: number;
          letter: string;
          homeroom_teacher_id?: string | null;
          capacity?: number;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
        Relationships: [];
      };

      students: {
        Row: Timestamps & {
          id: string;
          profile_id: string | null;
          full_name: string;
          birth_date: string | null;
          class_id: string | null;
          status: StudentStatus;
          enrolled_on: string;
          photo_path: string | null;
          notes: string | null;
          application_id: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          profile_id?: string | null;
          full_name: string;
          birth_date?: string | null;
          class_id?: string | null;
          status?: StudentStatus;
          enrolled_on?: string;
          photo_path?: string | null;
          notes?: string | null;
          application_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [];
      };

      student_guardians: {
        Row: {
          student_id: string;
          guardian_id: string;
          relation: GuardianRelation;
          is_primary: boolean;
          can_pick_up: boolean;
          created_at: string;
        };
        Insert: {
          student_id: string;
          guardian_id: string;
          relation?: GuardianRelation;
          is_primary?: boolean;
          can_pick_up?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["student_guardians"]["Insert"]>;
        Relationships: [];
      };

      enrollments: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          started_on: string;
          ended_on: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          started_on?: string;
          ended_on?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Insert"]>;
        Relationships: [];
      };

      terms: {
        Row: {
          id: string;
          academic_year_id: string;
          number: number;
          starts_on: string;
          ends_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          academic_year_id: string;
          number: number;
          starts_on: string;
          ends_on: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["terms"]["Insert"]>;
        Relationships: [];
      };

      lesson_slots: {
        Row: { id: string; position: number; starts_at: string; ends_at: string };
        Insert: { id?: string; position: number; starts_at: string; ends_at: string };
        Update: Partial<Database["public"]["Tables"]["lesson_slots"]["Insert"]>;
        Relationships: [];
      };

      schedule_entries: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          weekday: Weekday;
          lesson_slot_id: string;
          room: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          weekday: Weekday;
          lesson_slot_id: string;
          room?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedule_entries"]["Insert"]>;
        Relationships: [];
      };

      lessons: {
        Row: Timestamps & {
          id: string;
          schedule_entry_id: string;
          held_on: string;
          topic: string | null;
          homework: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          schedule_entry_id: string;
          held_on: string;
          topic?: string | null;
          homework?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };

      attendance: {
        Row: Timestamps & {
          id: string;
          lesson_id: string;
          student_id: string;
          status: AttendanceStatus;
          note: string | null;
          marked_by: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          lesson_id: string;
          student_id: string;
          status?: AttendanceStatus;
          note?: string | null;
          marked_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
        Relationships: [];
      };

      grade_entries: {
        Row: Timestamps & {
          id: string;
          lesson_id: string | null;
          student_id: string;
          subject_id: string;
          term_id: string;
          kind: GradeKind;
          value: number;
          comment: string | null;
          marked_by: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          lesson_id?: string | null;
          student_id: string;
          subject_id: string;
          term_id: string;
          kind?: GradeKind;
          value: number;
          comment?: string | null;
          marked_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["grade_entries"]["Insert"]>;
        Relationships: [];
      };

      term_grades: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          term_id: string;
          average: number | null;
          final_value: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          term_id: string;
          average?: number | null;
          final_value?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["term_grades"]["Insert"]>;
        Relationships: [];
      };

      student_tuition: {
        Row: {
          id: string;
          student_id: string;
          tuition_plan_id: string;
          discount_percent: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tuition_plan_id: string;
          discount_percent?: number;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["student_tuition"]["Insert"]>;
        Relationships: [];
      };

      invoices: {
        Row: Timestamps & {
          id: string;
          student_id: string;
          number: string;
          period_start: string;
          period_end: string;
          amount_kgs: number;
          status: InvoiceStatus;
          due_on: string;
          note: string | null;
        };
        Insert: Partial<Timestamps> & {
          id?: string;
          student_id: string;
          number?: string;
          period_start: string;
          period_end: string;
          amount_kgs: number;
          status?: InvoiceStatus;
          due_on: string;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };

      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount_kgs: number;
          method: PaymentMethod;
          status: PaymentStatus;
          receipt_path: string | null;
          paid_at: string;
          confirmed_by: string | null;
          confirmed_at: string | null;
          submitted_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount_kgs: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          receipt_path?: string | null;
          paid_at?: string;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          submitted_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };

      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          audience: AnnouncementAudience;
          class_id: string | null;
          author_id: string | null;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          audience?: AnnouncementAudience;
          class_id?: string | null;
          author_id?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
        Relationships: [];
      };

      notification_templates: {
        Row: { key: string; channel: NotificationChannel; body: I18nText; is_active: boolean };
        Insert: { key: string; channel: NotificationChannel; body?: I18nText; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["notification_templates"]["Insert"]>;
        Relationships: [];
      };

      notification_queue: {
        Row: {
          id: string;
          recipient_id: string;
          channel: NotificationChannel;
          template_key: string | null;
          payload: Json;
          status: NotificationStatus;
          attempts: number;
          last_error: string | null;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          channel: NotificationChannel;
          template_key?: string | null;
          payload?: Json;
          status?: NotificationStatus;
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notification_queue"]["Insert"]>;
        Relationships: [];
      };
    };

    Views: Record<never, never>;

    Functions: {
      auth_role: { Args: Record<string, never>; Returns: AppRole };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_office: { Args: Record<string, never>; Returns: boolean };
      application_rate_exceeded: {
        Args: { p_phone: string; p_ip: string | null };
        Returns: boolean;
      };
      guardian_of: { Args: { p_student_id: string }; Returns: boolean };
      teaches_class: { Args: { p_class_id: string }; Returns: boolean };
      is_own_student: { Args: { p_student_id: string }; Returns: boolean };
      transfer_student: {
        Args: { p_student_id: string; p_class_id: string; p_reason: string | null };
        Returns: void;
      };
      convert_application_to_student: {
        Args: { p_application_id: string };
        Returns: string;
      };
      open_lesson: {
        Args: { p_schedule_entry_id: string; p_held_on: string };
        Returns: string;
      };
      confirm_payment: {
        Args: { p_payment_id: string; p_approve: boolean };
        Returns: void;
      };
    };

    Enums: {
      app_role: AppRole;
      locale_code: LocaleCode;
      tuition_period: TuitionPeriod;
      application_status: ApplicationStatus;
      application_source: ApplicationSource;
      application_event_type: ApplicationEventType;
      student_status: StudentStatus;
      guardian_relation: GuardianRelation;
      weekday: Weekday;
      attendance_status: AttendanceStatus;
      grade_kind: GradeKind;
      invoice_status: InvoiceStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      announcement_audience: AnnouncementAudience;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
    };

    CompositeTypes: Record<never, never>;
  };
}

/** Короткие псевдонимы строк таблиц — чтобы не писать длинный путь в каждом файле. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
