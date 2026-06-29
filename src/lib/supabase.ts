import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ijjnhbxbkvdwbzpcnosu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqam5oYnhia3Zkd2J6cGNub3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDcxNjcsImV4cCI6MjA3NzIyMzE2N30.A7dgYlwbCcDdhvmtTwELc0i2tk6RZumOHZdxk90-Myw'
)

export interface LinkedInData {
  id: string;
  linkedin_url: string;
  first_name: string;
  last_name: string;
  position: string;
  photo_url: string;
  cover_url: string;
  analyzed_at: string;
  source: string;
  email?: string;
  
  // Scores globaux
  global_total_points: number;
  global_total_maximum: number;
  
  // Scores par catégorie
  banner_total_points: number;
  banner_total_maximum: number;
  banner_total_categories: number;
  
  photo_total_points: number;
  photo_total_maximum: number;
  photo_total_categories: number;
  
  headline_total_points: number;
  headline_total_maximum: number;
  headline_total_categories: number;
  
  about_total_points: number;
  about_total_maximum: number;
  about_total_categories: number;
  
  contenu_total_points: number;
  contenu_total_maximum: number;
  contenu_total_categories: number;
  
  experiences_total_points: number;
  experiences_total_maximum: number;
  experiences_total_categories: number;
  
  cred_total_points: number;
  cred_total_maximum: number;
  cred_total_categories: number;
  
  selection_total_points: number;
  selection_total_maximum: number;
  selection_total_categories: number;
  
  // Critères Banner
  banner_critere_1_titre: string;
  banner_critere_1_points_obtenus: number;
  banner_critere_1_points_maximum: number;
  banner_critere_1_explication: string | null;
  banner_critere_2_titre: string;
  banner_critere_2_points_obtenus: number;
  banner_critere_2_points_maximum: number;
  banner_critere_2_explication: string | null;
  banner_critere_3_titre: string;
  banner_critere_3_points_obtenus: number;
  banner_critere_3_points_maximum: number;
  banner_critere_3_explication: string | null;
  banner_critere_4_titre: string;
  banner_critere_4_points_obtenus: number;
  banner_critere_4_points_maximum: number;
  banner_critere_4_explication: string | null;
  
  // Critères Photo
  photo_critere_1_titre: string;
  photo_critere_1_points_obtenus: number;
  photo_critere_1_points_maximum: number;
  photo_critere_1_explication: string | null;
  photo_critere_2_titre: string;
  photo_critere_2_points_obtenus: number;
  photo_critere_2_points_maximum: number;
  photo_critere_2_explication: string | null;
  photo_critere_3_titre: string;
  photo_critere_3_points_obtenus: number;
  photo_critere_3_points_maximum: number;
  photo_critere_3_explication: string | null;
  
  // Critères Headline
  headline_critere_1_titre: string;
  headline_critere_1_points_obtenus: number;
  headline_critere_1_points_maximum: number;
  headline_critere_1_explication: string | null;
  headline_critere_2_titre: string;
  headline_critere_2_points_obtenus: number;
  headline_critere_2_points_maximum: number;
  headline_critere_2_explication: string | null;
  headline_critere_3_titre: string;
  headline_critere_3_points_obtenus: number;
  headline_critere_3_points_maximum: number;
  headline_critere_3_explication: string | null;
  headline_critere_4_titre: string;
  headline_critere_4_points_obtenus: number;
  headline_critere_4_points_maximum: number;
  headline_critere_4_explication: string | null;
  
  // Critères About
  about_critere_1_titre: string;
  about_critere_1_points_obtenus: number;
  about_critere_1_points_maximum: number;
  about_critere_1_explication: string | null;
  about_critere_2_titre: string;
  about_critere_2_points_obtenus: number;
  about_critere_2_points_maximum: number;
  about_critere_2_explication: string | null;
  about_critere_3_titre: string;
  about_critere_3_points_obtenus: number;
  about_critere_3_points_maximum: number;
  about_critere_3_explication: string | null;
  about_critere_4_titre: string;
  about_critere_4_points_obtenus: number;
  about_critere_4_points_maximum: number;
  about_critere_4_explication: string | null;
  
  // Critères Contenu
  contenu_critere_1_titre: string;
  contenu_critere_1_points_obtenus: number;
  contenu_critere_1_points_maximum: number;
  contenu_critere_1_explication: string | null;
  contenu_critere_2_titre: string;
  contenu_critere_2_points_obtenus: number;
  contenu_critere_2_points_maximum: number;
  contenu_critere_2_explication: string | null;
  contenu_critere_3_titre: string;
  contenu_critere_3_points_obtenus: number;
  contenu_critere_3_points_maximum: number;
  contenu_critere_3_explication: string | null;
  
  // Critères Experiences
  experiences_critere_1_titre: string;
  experiences_critere_1_points_obtenus: number;
  experiences_critere_1_points_maximum: number;
  experiences_critere_1_explication: string | null;
  experiences_critere_2_titre: string;
  experiences_critere_2_points_obtenus: number;
  experiences_critere_2_points_maximum: number;
  experiences_critere_2_explication: string | null;
  experiences_critere_3_titre: string;
  experiences_critere_3_points_obtenus: number;
  experiences_critere_3_points_maximum: number;
  experiences_critere_3_explication: string | null;
  experiences_critere_4_titre: string;
  experiences_critere_4_points_obtenus: number;
  experiences_critere_4_points_maximum: number;
  experiences_critere_4_explication: string | null;
  
  // Critères Crédibilité
  cred_critere_1_titre: string;
  cred_critere_1_points_obtenus: number;
  cred_critere_1_points_maximum: number;
  cred_critere_1_explication: string | null;
  cred_critere_2_titre: string;
  cred_critere_2_points_obtenus: number;
  cred_critere_2_points_maximum: number;
  cred_critere_2_explication: string | null;
  cred_critere_3_titre: string;
  cred_critere_3_points_obtenus: number;
  cred_critere_3_points_maximum: number;
  cred_critere_3_explication: string | null;
  
  // Critères Sélection
  selection_critere_1_titre: string;
  selection_critere_1_points_obtenus: number;
  selection_critere_1_points_maximum: number;
  selection_critere_1_explication: string | null;
}

export interface AdminUser {
  uid: string
  email: string
  full_name: string
}

export interface CVData {
  cv_id: string;
  candidate_first_name: string;
  candidate_last_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_address: string;
  candidate_profile_url: string;
  candidate_institution: string;
  candidate_current_stage: string;
  candidate_intl_experience_summary: string;
  candidate_work_experience_summary: string;
  candidate_notable_point: string;
  candidate_target_flag: number;
  candidate_target_reason: string;
  grand_total_awarded: number;
  grand_total_max: number;
  structure_visuals_awarded_sum: number;
  structure_visuals_max_sum: number;
  education_awarded_sum: number;
  education_max_sum: number;
  experience_awarded_sum: number;
  experience_max_sum: number;
  others_awarded_sum: number;
  others_max_sum: number;
  // Detailed criteria (example for Structure & Visuals)
  no_photo_desc: string;
  no_photo_points_awarded: number;
  no_photo_points_max: number;
  no_photo_feedback: string;
  english_cv_desc: string;
  english_cv_points_awarded: number;
  english_cv_points_max: number;
  english_cv_feedback: string;
  one_page_length_desc: string;
  one_page_length_points_awarded: number;
  one_page_length_points_max: number;
  one_page_length_feedback: string;
  single_column_layout_desc: string;
  single_column_layout_points_awarded: number;
  single_column_layout_points_max: number;
  single_column_layout_feedback: string;
  no_color_desc: string;
  no_color_points_awarded: number;
  no_color_points_max: number;
  no_color_feedback: string;
  readable_formatting_desc: string;
  readable_formatting_points_awarded: number;
  readable_formatting_points_max: number;
  readable_formatting_feedback: string;
  uniform_margins_desc: string;
  uniform_margins_points_awarded: number;
  uniform_margins_points_max: number;
  uniform_margins_feedback: string;
  three_section_structure_desc: string;
  three_section_structure_points_awarded: number;
  three_section_structure_points_max: number;
  three_section_structure_feedback: string;
  // Education
  education_completeness_desc: string;
  education_completeness_points_awarded: number;
  education_completeness_points_max: number;
  education_completeness_feedback: string;
  honors_tests_desc: string;
  honors_tests_points_awarded: number;
  honors_tests_points_max: number;
  honors_tests_feedback: string;
  relevant_courses_desc: string;
  relevant_courses_points_awarded: number;
  relevant_courses_points_max: number;
  relevant_courses_feedback: string;
  exchanges_double_degrees_desc: string;
  exchanges_double_degrees_points_awarded: number;
  exchanges_double_degrees_points_max: number;
  exchanges_double_degrees_feedback: string;
  // Experience
  reverse_chronological_desc: string;
  reverse_chronological_points_awarded: number;
  reverse_chronological_points_max: number;
  reverse_chronological_feedback: string;
  clear_titles_desc: string;
  clear_titles_points_awarded: number;
  clear_titles_points_max: number;
  clear_titles_feedback: string;
  experience_substance_desc: string;
  experience_substance_points_awarded: number;
  experience_substance_points_max: number;
  experience_substance_feedback: string;
  bullet_count_desc: string;
  bullet_count_points_awarded: number;
  bullet_count_points_max: number;
  bullet_count_feedback: string;
  action_verbs_desc: string;
  action_verbs_points_awarded: number;
  action_verbs_points_max: number;
  action_verbs_feedback: string;
  tangible_outcomes_desc: string;
  tangible_outcomes_points_awarded: number;
  tangible_outcomes_points_max: number;
  tangible_outcomes_feedback: string;
  use_of_numbers_desc: string;
  use_of_numbers_points_awarded: number;
  use_of_numbers_points_max: number;
  use_of_numbers_feedback: string;
  concision_clarity_desc: string;
  concision_clarity_points_awarded: number;
  concision_clarity_points_max: number;
  concision_clarity_feedback: string;
  // Others
  professional_email_desc: string;
  professional_email_points_awarded: number;
  professional_email_points_max: number;
  professional_email_feedback: string;
  phone_format_desc: string;
  phone_format_points_awarded: number;
  phone_format_points_max: number;
  phone_format_feedback: string;
  location_mobility_desc: string;
  location_mobility_points_awarded: number;
  location_mobility_points_max: number;
  location_mobility_feedback: string;
  professional_links_desc: string;
  professional_links_points_awarded: number;
  professional_links_points_max: number;
  professional_links_feedback: string;
  banned_header_desc: string;
  banned_header_points_awarded: number;
  banned_header_points_max: number;
  banned_header_feedback: string;
  skills_tools_desc: string;
  skills_tools_points_awarded: number;
  skills_tools_points_max: number;
  skills_tools_feedback: string;
  languages_desc: string;
  languages_points_awarded: number;
  languages_points_max: number;
  languages_feedback: string;
  certifications_desc: string;
  certifications_points_awarded: number;
  certifications_points_max: number;
  certifications_feedback: string;
  interests_desc: string;
  interests_points_awarded: number;
  interests_points_max: number;
  interests_feedback: string;
  summary_profile_desc: string;
  summary_profile_points_awarded: number;
  summary_profile_points_max: number;
  summary_profile_feedback: string;
  // Bonus bullets
  pass4_bullet_original: string;
  pass4_bullet_feedback: string;
  pass4_bullet_suggestion: string;
}
