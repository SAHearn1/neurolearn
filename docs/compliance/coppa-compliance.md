# COPPA Compliance Plan

## Children's Online Privacy Protection Act (15 U.S.C. §§ 6501–6506)

### Applicability
NeuroLearn is designed for learners of all ages, including children under 13. COPPA compliance is **mandatory** when the platform is used by children under 13.

### Requirements and Implementation

#### 1. Verifiable Parental Consent
- **Age gate**: During registration, users must provide date of birth
- **Under-13 flow**: Account creation requires parent/guardian email for consent
- **Consent mechanism**: Parent receives email with consent link; account remains restricted until consent is verified
- **Implementation**: `user_settings.age_verified` flag + `parent_student_links` with active status

#### 2. Privacy Policy (Child-Directed)
- Clear, plain-language privacy notice accessible from registration and footer
- Describes: what data is collected, how it's used, who has access, parental rights
- Reading level: 6th grade or below

#### 3. Data Minimization
| Data Collected | Purpose | Necessary? |
|---|---|---|
| Display name | Personalization | Yes |
| Email (parent) | Consent verification | Yes |
| Learning progress | Core functionality | Yes |
| Learning styles | Adaptive content | Yes |
| Accessibility prefs | Accommodation | Yes |
| RACA cognitive data | Learning scaffolding | Yes (when enabled) |
| Avatar | Personalization | No — optional |

#### 4. Data Not Collected from Children
- No geolocation tracking
- No persistent device identifiers beyond session
- No behavioral advertising or tracking cookies
- No social media integration
- No in-app purchases
- No audio/video recording from device

#### 5. Parental Rights
- **Access**: Parents can view all child data via Parent Dashboard
- **Delete**: Parents can request full data deletion via admin or self-service
- **Revoke consent**: Parents can revoke consent; account is deactivated within 24 hours
- **Export**: CSV export of all child data available

#### 6. Data Security
- All data encrypted in transit (TLS 1.3 via Supabase/Vercel)
- Database encrypted at rest (Supabase managed PostgreSQL)
- RLS ensures children cannot access other children's data
- No PII transmitted to AI providers (prompts contain only session context)

#### 7. Operator Responsibilities
- NeuroLearn acts as **operator** when used directly by families
- NeuroLearn acts as **school service provider** when deployed by a school (COPPA school exception applies with school authorization)

### Age Gate Implementation
```
Registration Flow:
1. User enters date of birth
2. If age >= 13: standard registration
3. If age < 13:
   a. Require parent/guardian email
   b. Send consent verification email to parent
   c. Create account in 'pending_consent' status
   d. Limit access until consent verified
   e. If no consent within 14 days: delete account
```

### Annual Review
- Yearly audit of data collection practices
- Review of third-party service agreements
- Update privacy policy as needed
- Staff training on COPPA requirements
