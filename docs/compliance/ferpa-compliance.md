# FERPA Compliance Plan

## Family Educational Rights and Privacy Act (20 U.S.C. § 1232g)

### Applicability
NeuroLearn processes **education records** — information directly related to students that is maintained by the educational institution or by a party acting on behalf of the institution. FERPA applies when NeuroLearn is used by schools receiving federal funding.

### Protected Information
| Data Category | Examples in NeuroLearn | Storage Location |
|---|---|---|
| Student identity | display_name, email, user_id | profiles table |
| Academic records | lesson_progress, scores, time_spent | lesson_progress table |
| Learning accommodations | accessibility preferences, learning_styles | profiles, user_settings |
| Behavioral data | RACA cognitive states, epistemic profiles | cognitive_sessions, epistemic_profiles |
| Communication records | Parent-educator messages | notifications table |

### Technical Controls

#### 1. Access Controls (Directory Information vs PII)
- **Row Level Security (RLS)** enforces that students can only access their own records
- **Educator access** limited to students in their enrolled classes via `class_enrollments` join
- **Parent access** limited to linked students via `parent_student_links` (active status only)
- **Admin access** requires `admin` role in profiles table
- **No public access** to any student data — all tables require authentication

#### 2. Consent and Disclosure
- **Parental consent** required for students under 18 (managed via parent-student linking)
- **Legitimate educational interest** — educators only see students in their classes
- **No third-party disclosure** — student data is not shared with external services except:
  - Supabase (data processor, under DPA)
  - Anthropic (AI agent interactions, no PII sent in prompts)
  - Vercel (hosting, no database access)

#### 3. Right to Inspect and Amend
- Parents and eligible students can view all their records via Profile page
- Correction requests processed via admin dashboard
- Data export available via parent progress report views (CSV export)

#### 4. Annual Notification
- Privacy policy displayed during registration
- Annual notification sent via notification system at school year start

#### 5. Data Retention and Deletion
- Student records retained for duration of enrollment + 3 years
- Deletion requests honored within 30 days via admin dashboard
- Audit log entries retained permanently (immutable, anonymized after deletion)

### Operational Procedures

1. **School Agreement**: Before deployment, each school signs a data processing agreement specifying FERPA obligations
2. **Staff Training**: Educators complete privacy training before accessing student data
3. **Breach Notification**: Security incidents reported to school within 72 hours
4. **Annual Audit**: Yearly review of access logs to ensure compliance

### Data Flow Diagram
```
Student → NeuroLearn App → Supabase (PostgreSQL + Auth)
                        → Anthropic API (no PII, session context only)
                        → Vercel (static hosting, no data storage)

Educator → NeuroLearn App → Supabase (RLS-scoped to enrolled students)

Parent → NeuroLearn App → Supabase (RLS-scoped to linked children)

Admin → NeuroLearn App → Supabase (full access with audit logging)
```
