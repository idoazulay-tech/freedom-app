# 📊 Questionnaire & Profile Review - Freedom Platform

**Document:** סקירה מלאה של השאלון והפרופיל  
**Updated:** 2026-04-03  
**Purpose:** תיעוד מה קיים, מה עובד, מה צריך להיות

---

## 🎯 Executive Summary

**המצב הנוכחי:**
- ✅ **Questionnaire (ProfessionalDiagnosis)** - קיים וחלקית עובד
- ❌ **Profile Page** - ריק לגמרי ("בבנייה")
- ⚠️ **Data Flow** - חלקי - נתונים נשמרים אבל לא מוצגים

**הבעיה הקריטית:**
משתמש עובר דרך השאלון, שומר נתונים, אבל כשהוא הולך לפרופיל - אין כלום!

---

## 📋 Part 1: Current Questionnaire (ProfessionalDiagnosis)

### What It Currently Does

**4 שלבים:**

#### **שלב 1: בחר סוג חוב**
```
בחר את סוג החוב שלך:
- כרטיס אשראי
- הלוואה מחברת אשראי
- הלוואה על מסגרת אשראי (Credit Line)
- הלוואה בנקאית
- הלוואה אישית
- משכנתא
- חובות מס
- חובות עירוניים
- אחר
```

**מה זה עושה:**
- משתמש בוחר קטגוריה
- מתחיל עם `debts: [{ category, amount: 0, riskScore: 0 }]`

#### **שלב 2: הוסף פרטי חוב**
```
שדות:
- סכום החוב (₪) - מספר
- הערה על החוב - טקסט
```

**מה זה עושה:**
- משתמש מזין את סכום החוב
- משתמש יכול להוסיף הערה

#### **שלב 3: שאלות אבחון**
```
שאלות:
- האם יש הוצל"פ פעיל?
- האם יש הליך משפטי?
- האם יש משכנתא?
```

**מה זה עושה:**
- Checkboxes לכל שאלה
- שומר בתוך `diagnosisData`

#### **שלב 4: סיכום וביקורת**
```
מציג:
- סכום כולל: ₪X
- רמת סיכון: X
```

**מה זה עושה:**
- מציג סיכום
- כפתור "סיים אבחון" לשמירה

### Data Saved to Database

```javascript
{
  riskScore: formData.totalRisk,
  riskLevel: 'critical' | 'high' | 'medium' | 'low',
  totalDebt: formData.totalAmount,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  availableForDebt: 0,
  creditorCount: formData.debts.length,
  hasEnforcement: false,
  hasWarningLetters: false,
  debts: formData.debts,
  actions: [],
}
```

### Problems with Current Questionnaire

| בעיה | השפעה | חומרה |
|------|-------|--------|
| **monthlyIncome/Expenses = 0** | לא ניתן לחשב יכולת תשלום | 🔴 קריטי |
| **hasEnforcement/hasWarningLetters = false** | לא שואלים על הוצל"פ בפועל | 🔴 קריטי |
| **רק 3 שאלות** | לא מספיק מידע לאבחון | 🟡 חשוב |
| **לא שואלים על Persona** | לא ניתן לסווג Yossi/Dana/Avi | 🔴 קריטי |
| **לא שואלים על סוגי חובות נוספים** | משתמש יכול להוסיף רק חוב אחד | 🟡 חשוב |
| **לא שואלים על מצב משפטי** | לא ניתן לתת ייעוץ משפטי | 🟡 חשוב |

---

## 🎯 Part 2: What Profile Should Display

### Current State
```
דף פרופיל - בבנייה
```

### What It SHOULD Display

#### **Section 1: User Identity & Status**
```
👤 סטטוס משתמש
├─ שם: [משתמש]
├─ תאריך הצטרפות: [תאריך]
├─ סטטוס: [פעיל/לא פעיל]
└─ Persona: [Yossi/Dana/Avi]
```

#### **Section 2: Debt Overview**
```
💰 סיכום חובות
├─ סכום כולל: ₪X
├─ מספר חובות: X
├─ רמת סיכון כללית: [Low/Medium/High/Critical]
├─ אחוז מהכנסה: X%
└─ זמן משוער לפתרון: X חודשים
```

#### **Section 3: Debts Breakdown**
```
📊 פירוט חובות
├─ חוב 1: [סוג] - ₪X - [סטטוס]
├─ חוב 2: [סוג] - ₪X - [סטטוס]
└─ חוב 3: [סוג] - ₪X - [סטטוס]
```

#### **Section 4: Risk Assessment**
```
⚠️ הערכת סיכון
├─ רמת סיכון: [0-200]
├─ סיווג: [Low/Medium/High/Critical]
├─ סימני אזהרה:
│  ├─ הוצל"פ פעיל: [כן/לא]
│  ├─ הליך משפטי: [כן/לא]
│  └─ משכנתא בסיכון: [כן/לא]
└─ מה זה אומר: [הסבר בעברית]
```

#### **Section 5: Financial Capacity**
```
💵 יכולת פיננסית
├─ הכנסה חודשית: ₪X
├─ הוצאות חודשיות: ₪X
├─ זמין לתשלום חובות: ₪X
└─ יחס חוב להכנסה: X%
```

#### **Section 6: Recommended Actions**
```
✅ פעולות מומלצות
├─ פעולה 1: [תיאור]
├─ פעולה 2: [תיאור]
└─ פעולה 3: [תיאור]
```

#### **Section 7: Matched Professionals**
```
👨‍⚖️ מומחים מומלצים
├─ מומחה 1: [שם] - [התמחות] - ⭐ X/5
├─ מומחה 2: [שם] - [התמחות] - ⭐ X/5
└─ מומחה 3: [שם] - [התמחות] - ⭐ X/5
```

#### **Section 8: Payment Plan**
```
📅 תוכנית תשלומים
├─ חודש 1: ₪X
├─ חודש 2: ₪X
└─ חודש 12: ₪X
```

#### **Section 9: Automated Tasks**
```
🤖 משימות אוטומטיות
├─ [ ] שלח מכתב לנושה #1
├─ [ ] בקש הנחה בריבית
└─ [ ] הגש בקשה להסדר
```

#### **Section 10: Legal Status**
```
⚖️ סטטוס משפטי
├─ הוצל"פ: [סטטוס]
├─ בקשה לפשיטת רגל: [סטטוס]
└─ הליכים משפטיים: [סטטוס]
```

---

## 📈 Part 3: Data Flow

### Current Flow
```
ProfessionalDiagnosis (Questionnaire)
         ↓
    Save to Database
         ↓
    Profile Page (EMPTY!)
```

### What It Should Be
```
ProfessionalDiagnosis (Questionnaire)
         ↓
    Diagnosis Agent (AI Analysis)
         ↓
    Save to Database
         ↓
    Fetch from Database
         ↓
    Profile Page (Display Everything)
```

---

## 🔧 Part 4: What Needs to Be Fixed

### Immediate Fixes (Critical)

| Item | Current | Should Be | Priority |
|------|---------|-----------|----------|
| **Profile Page** | Empty | Display all data | 🔴 Critical |
| **Monthly Income** | Not asked | Ask in questionnaire | 🔴 Critical |
| **Monthly Expenses** | Not asked | Ask in questionnaire | 🔴 Critical |
| **Enforcement Status** | Always false | Ask in questionnaire | 🔴 Critical |
| **Persona Classification** | Not done | Classify in Diagnosis Agent | 🔴 Critical |

### Important Enhancements

| Item | Current | Should Be | Priority |
|------|---------|-----------|----------|
| **Number of Debts** | Only 1 | Allow multiple | 🟡 Important |
| **Legal Questions** | 3 questions | 10+ questions | 🟡 Important |
| **Payment Plan** | Not shown | Show schedule | 🟡 Important |
| **Professionals** | Not shown | Show matched pros | 🟡 Important |
| **Risk Explanation** | Just a number | Explain what it means | 🟡 Important |

### Nice to Have

| Item | Current | Should Be | Priority |
|------|---------|-----------|----------|
| **Charts** | None | Risk trend chart | 🟢 Nice |
| **Timeline** | None | Debt resolution timeline | 🟢 Nice |
| **Notifications** | None | Alert on new actions | 🟢 Nice |
| **Export** | None | Download PDF report | 🟢 Nice |

---

## 🎯 Part 5: Phased Implementation Plan

### Phase 1: Fix Critical Issues (1-2 days)
**Goal:** Make the questionnaire ask the right questions and save proper data

**Tasks:**
1. ✅ Add Monthly Income field to questionnaire
2. ✅ Add Monthly Expenses field to questionnaire
3. ✅ Add Enforcement Status checkbox
4. ✅ Add Warning Letters checkbox
5. ✅ Add Persona classification logic
6. ✅ Save all data correctly to database

**Success Criteria:**
- Questionnaire asks 10+ questions
- All data is saved to database
- No zero values for income/expenses

### Phase 2: Build Profile Page (1-2 days)
**Goal:** Display all saved data in a clear, organized way

**Tasks:**
1. ✅ Fetch diagnosis data from database
2. ✅ Display User Identity section
3. ✅ Display Debt Overview section
4. ✅ Display Debts Breakdown section
5. ✅ Display Risk Assessment section
6. ✅ Display Financial Capacity section
7. ✅ Display Recommended Actions section

**Success Criteria:**
- Profile page displays all 7 sections
- Data is formatted clearly
- No errors or missing data

### Phase 3: Add Advanced Features (2-3 days)
**Goal:** Add matched professionals, payment plans, and automated tasks

**Tasks:**
1. ✅ Fetch matched professionals from database
2. ✅ Display Matched Professionals section
3. ✅ Generate and display Payment Plan
4. ✅ Display Automated Tasks section
5. ✅ Display Legal Status section

**Success Criteria:**
- Profile page displays all 10 sections
- Professionals are matched correctly
- Payment plan is calculated correctly

### Phase 4: Polish & Optimize (1 day)
**Goal:** Make it look great and work smoothly

**Tasks:**
1. ✅ Add charts and visualizations
2. ✅ Add animations and transitions
3. ✅ Optimize performance
4. ✅ Test on mobile
5. ✅ Get user feedback

**Success Criteria:**
- Profile page looks professional
- Works smoothly on all devices
- User feedback is positive

---

## 📝 Part 6: Questions for Questionnaire

### Current Questions (3)
1. האם יש הוצל"פ פעיל?
2. האם יש הליך משפטי?
3. האם יש משכנתא?

### Recommended Full Set (15+ questions)

#### **Financial Information**
1. מה ההכנסה החודשית שלך? (₪)
2. מה ההוצאות החודשיות שלך? (₪)
3. כמה זמן אתה בחוב? (חודשים)
4. האם יש לך חיסכון? (₪)

#### **Debt Details**
5. כמה חובות יש לך? (מספר)
6. מה הסכום הכולל? (₪)
7. מי הנושים הראשיים? (שמות)
8. מה הריביות? (%)

#### **Legal Status**
9. האם יש הוצל"פ פעיל?
10. האם יש בקשה לפשיטת רגל?
11. האם יש הליך משפטי?
12. האם יש מכתבי התראה?

#### **Personal Situation**
13. מה מצבך המשפחתי? (נשוי/רווק)
14. כמה ילדים יש לך?
15. מה תחום עבודתך?

#### **Motivation & Goals**
16. מה המטרה שלך? (להיפטר מחוב/להסדר)
17. כמה זמן אתה מוכן לקחת? (חודשים)
18. האם אתה מעוניין בעזרה משפטית?

---

## 🎁 Part 7: Profile Features & Capabilities

### What Profile Should Enable

#### **View & Understand**
- ✅ See full debt picture
- ✅ Understand risk level
- ✅ See payment capacity
- ✅ Understand legal status

#### **Take Action**
- ✅ Contact matched professional
- ✅ Download payment plan
- ✅ Start automated tasks
- ✅ Request legal consultation

#### **Track Progress**
- ✅ See debt reduction
- ✅ Track payments
- ✅ Monitor risk level
- ✅ Check task completion

#### **Get Support**
- ✅ Chat with professional
- ✅ Get personalized advice
- ✅ Schedule consultation
- ✅ Access resources

#### **Plan Future**
- ✅ See payment schedule
- ✅ Estimate resolution time
- ✅ Plan financial recovery
- ✅ Set milestones

---

## 🚀 Part 8: Success Metrics

### For Questionnaire
- ✅ 90%+ completion rate
- ✅ Average time: 5-10 minutes
- ✅ All required data collected
- ✅ No validation errors

### For Profile
- ✅ 100% data accuracy
- ✅ Load time < 2 seconds
- ✅ Mobile responsive
- ✅ User satisfaction > 4/5

### For Overall System
- ✅ User can complete flow in < 15 minutes
- ✅ User gets actionable insights
- ✅ User feels empowered
- ✅ User takes next step (contact pro)

---

## 📌 Next Steps

### Immediate (Today)
1. ✅ Update questionnaire to ask all critical questions
2. ✅ Build Profile page to display all data
3. ✅ Test data flow end-to-end

### Short Term (This Week)
1. ✅ Add matched professionals display
2. ✅ Add payment plan visualization
3. ✅ Add automated tasks section

### Medium Term (Next Week)
1. ✅ Add charts and analytics
2. ✅ Add professional contact system
3. ✅ Add task automation

### Long Term (Next Month)
1. ✅ Add mobile app
2. ✅ Add real-time notifications
3. ✅ Add community features

---

## 🎯 The Goal

**Make it so that:**
1. User completes questionnaire in 5-10 minutes
2. User sees complete profile with all insights
3. User understands their situation
4. User knows what to do next
5. User takes action (contacts professional)

**Without:**
- Overwhelming them with 100% perfect data
- Making them fill out 50 questions
- Showing incomplete information
- Leaving them confused

**Result:**
- User feels empowered
- User sees value immediately
- User comes back to use the system
- User refers friends

---

**This document is the blueprint for fixing the questionnaire and profile. Follow it step by step.**
