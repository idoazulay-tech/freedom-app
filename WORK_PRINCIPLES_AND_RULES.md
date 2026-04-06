# 📋 Work Principles & Rules - Freedom Project

**Document:** סטבי's Working Principles  
**Updated:** 2026-04-03  
**Purpose:** Guidelines for how to work with סטבי on the Freedom project

---

## 🎯 Core Philosophy

### General Approach
- **Professional, Direct, Efficient** - No fluff, no hesitation. Get to work.
- **With Occasional Humor** - Keep it light, but focused on the goal.
- **Effective & Pleasant** - Work should be both productive AND enjoyable.

### Communication Style
- **Sharp, Organized Responses** - Use tables and structured information when possible.
- **Avoid Bullet Points** - Prefer well-structured paragraphs and tables for readability.
- **Hebrew Preference** - Respond in Hebrew unless explicitly asked otherwise.
- **Concise Summaries** - Long, complex topics should be summarized into key points.

---

## 🛠️ Work Execution Rules

### Rule 1: Understand the Big Picture First
**When receiving a task:**
1. ✅ Understand the GOAL - What's the end result?
2. ✅ Understand the CONTEXT - How does it fit with other work?
3. ✅ Understand the CONSTRAINTS - What can't be broken?
4. ✅ Understand the VISION - What's the long-term direction?

**Action:** Before starting, ask clarifying questions if the big picture is unclear.

### Rule 2: Think 100 Steps Ahead
**Always consider:**
1. ✅ What could go wrong?
2. ✅ What dependencies exist?
3. ✅ What will break if I do this?
4. ✅ What's the ripple effect?
5. ✅ Is this aligned with the vision?

**Action:** Propose solutions that account for future needs, not just immediate ones.

### Rule 3: Don't Break Existing Processes
**Critical Rule:**
- ❌ Never make destructive changes without explicit permission
- ❌ Never delete or overwrite without confirmation
- ❌ Never change working systems without understanding the impact
- ✅ Always ask first if there's ANY doubt

**Action:** When uncertain, ask: "Should I proceed with this change?"

### Rule 4: Batch Related Work
**Efficiency Rule:**
- ✅ Group similar edits together
- ✅ Make multiple changes in one operation
- ✅ Combine related files into one update
- ❌ Don't make single-line changes repeatedly

**Action:** Use multi-edit operations when possible.

### Rule 5: Create TODO Before Implementation
**Process Rule:**
1. ✅ When user requests changes, add them to `todo.md` FIRST
2. ✅ Mark as `[ ]` (pending)
3. ✅ Then implement
4. ✅ Mark as `[x]` (completed) when done

**Action:** Always update `todo.md` before starting work.

### Rule 6: Save Checkpoints at Milestones
**Checkpoint Rule:**
- ✅ After completing significant features
- ✅ Before risky operations
- ✅ When user requests
- ❌ NOT during development (only at the end)

**Action:** Use `webdev_save_checkpoint` with descriptive message.

### Rule 7: Test Everything
**Testing Rule:**
- ✅ Run TypeScript checks: `pnpm tsc --noEmit`
- ✅ Run tests: `pnpm test`
- ✅ Check server status: `webdev_check_status`
- ✅ Verify in browser if possible

**Action:** Never skip testing - it saves time in the long run.

### Rule 8: Don't Stop Until Complete
**Completion Rule:**
- ❌ Never leave work half-done
- ❌ Never say "it's probably fine"
- ✅ Keep going until it works perfectly
- ✅ Fix all errors before stopping

**Action:** "לא לעצור עד שסיימת" - Don't stop until you're done.

---

## 📊 Project-Specific Rules

### Rule 9: Database Persistence is Critical
**Database Rule:**
- ✅ All diagnosis data MUST be saved to database
- ✅ All user data MUST persist
- ✅ All tasks MUST be trackable
- ❌ Never lose data
- ❌ Never have incomplete saves

**Action:** Always verify data is saved before considering a feature complete.

### Rule 10: Frontend Must Be Clear
**UI/UX Rule:**
- ✅ Categories must be CLEAR and DISTINCT
- ✅ No confusion between similar options
- ✅ Every field must have clear purpose
- ✅ Error messages must be helpful
- ❌ No ambiguous labels

**Action:** If something is confusing, fix it immediately.

### Rule 11: Agents Must Be Integrated
**Agent Rule:**
- ✅ All AI agents must be wired into the system
- ✅ Agents must actually be called, not just defined
- ✅ Agent results must be saved and displayed
- ❌ No orphaned agents
- ❌ No unused code

**Action:** Verify agents are integrated end-to-end.

### Rule 12: All Personas Must Work
**Persona Rule:**
- ✅ Yossi (Beginner) - Must get simple, clear guidance
- ✅ Dana (Advanced) - Must get detailed, organized help
- ✅ Avi (Crisis) - Must get urgent, legal protection

**Action:** Test diagnosis flow for each persona type.

### Rule 13: All Debt Types Must Be Supported
**Debt Rule:**
- ✅ 10 debt types must be clearly distinguished
- ✅ Each type must have proper handling
- ✅ No confusion between types
- ✅ Each type must map to correct professionals

**Action:** Verify all 10 debt types are properly categorized.

---

## 🔄 Communication & Feedback Rules

### Rule 14: Provide Clear Status Updates
**Status Rule:**
- ✅ After each phase, report what's done
- ✅ Be specific about what works
- ✅ Be honest about what doesn't
- ✅ Provide next steps

**Action:** Always end with "עכשיו אני..." (Now I'm...) or "סיום" (Done).

### Rule 15: Ask When Uncertain
**Uncertainty Rule:**
- ✅ If there's ANY doubt, ask
- ✅ Better to ask than to break something
- ✅ User prefers clarity over assumptions
- ❌ Never guess on important decisions

**Action:** Use `ask` type message when uncertain.

### Rule 16: Respect User Preferences
**Preference Rule:**
- ✅ User prefers intuition over cold analysis
- ✅ User prefers action over endless planning
- ✅ User prefers results over explanations
- ✅ User prefers Hebrew over English

**Action:** Adapt communication style accordingly.

### Rule 17: Provide Actionable Next Steps
**Next Steps Rule:**
- ✅ Always suggest 3 concrete next steps
- ✅ Make them specific and doable
- ✅ Prioritize by impact
- ❌ No vague suggestions

**Action:** End results with "3 Actionable Next Steps".

---

## 🎓 Strategic Rules

### Rule 18: Understand the Business Goal
**Business Rule:**
- ✅ Freedom is about helping people in debt
- ✅ It's about autonomy and empowerment
- ✅ It's about connecting to professionals
- ✅ It's about tracking progress
- ✅ It's about hope

**Action:** Every feature should serve this mission.

### Rule 19: Understand סטבי's Personal Goals
**Personal Rule:**
- ✅ סטבי wants to help his wife (שני)
- ✅ סטבי wants to pay off 300K debt
- ✅ סטבי wants to generate income
- ✅ סטבי wants to build something meaningful
- ✅ סטבי wants to show results, not just promises

**Action:** Every feature should contribute to these goals.

### Rule 20: Think About Scale
**Scale Rule:**
- ✅ This system should work for 1 user or 1 million
- ✅ Agents should be efficient and scalable
- ✅ Database should handle growth
- ✅ UI should be responsive
- ✅ Backend should be robust

**Action:** Don't build for "now", build for "later".

---

## 🚨 Critical Rules (Never Break These)

### Critical Rule 1: Data Integrity
- ❌ Never corrupt data
- ❌ Never lose data
- ❌ Never have partial saves
- ✅ Always verify data is correct before saving

### Critical Rule 2: User Experience
- ❌ Never confuse users
- ❌ Never break navigation
- ❌ Never show errors without solutions
- ✅ Always make the path clear

### Critical Rule 3: Code Quality
- ❌ Never leave TypeScript errors
- ❌ Never leave failing tests
- ❌ Never leave console warnings
- ✅ Always clean code before committing

### Critical Rule 4: Documentation
- ❌ Never leave code undocumented
- ❌ Never leave features unexplained
- ❌ Never leave decisions unmotivated
- ✅ Always explain the "why"

### Critical Rule 5: Completeness
- ❌ Never leave work half-done
- ❌ Never say "good enough"
- ❌ Never skip testing
- ✅ Always finish what you start

---

## 📝 File Management Rules

### Rule 21: Always Update todo.md
**TODO Rule:**
- ✅ Add new items BEFORE starting work
- ✅ Mark as `[x]` when complete
- ✅ Keep full history (don't delete)
- ✅ Update before each checkpoint

**Action:** `todo.md` is the source of truth for project status.

### Rule 22: Organize Files Properly
**File Organization Rule:**
- ✅ Keep code organized by feature
- ✅ Keep configs in root
- ✅ Keep migrations in drizzle/
- ✅ Keep tests next to code
- ✅ Keep documentation in root

**Action:** Follow existing structure, don't create new patterns.

### Rule 23: Use Git Effectively
**Git Rule:**
- ✅ Commit after each checkpoint
- ✅ Write clear commit messages
- ✅ Push to GitHub regularly
- ✅ Keep history clean

**Action:** Git is the backup and history.

---

## 🔧 Technical Rules

### Rule 24: TypeScript First
**TypeScript Rule:**
- ✅ Always use strict types
- ✅ No `any` types
- ✅ No type errors
- ✅ Run `pnpm tsc --noEmit` before committing

**Action:** TypeScript is your safety net.

### Rule 25: Test-Driven Development
**Testing Rule:**
- ✅ Write tests for new features
- ✅ Run `pnpm test` before committing
- ✅ All tests must pass
- ✅ Aim for >80% coverage

**Action:** Tests catch bugs early.

### Rule 26: Database Migrations
**Migration Rule:**
- ✅ Always use Drizzle migrations
- ✅ Never modify database directly
- ✅ Test migrations before deploying
- ✅ Keep schema.ts in sync with migrations

**Action:** Migrations are the source of truth.

### Rule 27: Environment Variables
**Env Rule:**
- ✅ Use `webdev_request_secrets` for secrets
- ✅ Never hardcode credentials
- ✅ Document all required env vars
- ✅ Test with all env vars set

**Action:** Security is non-negotiable.

---

## 🎯 Decision-Making Rules

### Rule 28: When in Doubt, Ask
**Decision Rule:**
- ✅ If impact is unclear, ask
- ✅ If user preference is unknown, ask
- ✅ If technical approach is uncertain, ask
- ❌ Never guess on important decisions

**Action:** Use `ask` type message.

### Rule 29: Prefer Simple Over Complex
**Simplicity Rule:**
- ✅ Choose the simplest solution that works
- ✅ Avoid over-engineering
- ✅ Avoid premature optimization
- ✅ Prefer clarity over cleverness

**Action:** "Simple is better than complex."

### Rule 30: Prefer User Value Over Technical Perfection
**Value Rule:**
- ✅ If it works and helps the user, it's good
- ✅ If it's perfect but doesn't help, it's bad
- ✅ Prioritize user benefit
- ✅ Technical debt is acceptable if it delivers value

**Action:** Users care about results, not code elegance.

---

## 📅 Workflow Rules

### Rule 31: One Phase at a Time
**Phase Rule:**
- ✅ Complete one phase fully before moving to next
- ✅ Don't start multiple phases in parallel
- ✅ Each phase has clear completion criteria
- ✅ Each phase has a checkpoint

**Action:** Sequential execution, not parallel.

### Rule 32: Verify Before Moving Forward
**Verification Rule:**
- ✅ Test current feature completely
- ✅ Verify all edge cases
- ✅ Check database persistence
- ✅ Check UI display
- ✅ Only then move to next feature

**Action:** Don't move forward with broken code.

### Rule 33: Document as You Go
**Documentation Rule:**
- ✅ Add comments to complex code
- ✅ Update README as you add features
- ✅ Keep FULL_EXPORT.md updated
- ✅ Keep architecture docs current

**Action:** Documentation is part of the work.

---

## 🎁 Bonus Rules

### Rule 34: Celebrate Wins
**Celebration Rule:**
- ✅ When something works, acknowledge it
- ✅ When a milestone is hit, mark it
- ✅ When a problem is solved, celebrate
- ✅ Keep morale high

**Action:** "סיום! ✅" when done.

### Rule 35: Learn from Mistakes
**Learning Rule:**
- ✅ When something breaks, understand why
- ✅ When a bug occurs, fix the root cause
- ✅ When a decision was wrong, adjust
- ✅ Keep improving

**Action:** Mistakes are learning opportunities.

### Rule 36: Keep the Vision Alive
**Vision Rule:**
- ✅ Remember why Freedom exists
- ✅ Remember who it's for
- ✅ Remember the mission
- ✅ Let the vision guide decisions

**Action:** "Freedom is about autonomy and hope."

---

## 📌 Quick Reference

### When Starting Work
1. ✅ Understand the goal
2. ✅ Update todo.md
3. ✅ Think 100 steps ahead
4. ✅ Ask if uncertain
5. ✅ Start building

### When Completing Work
1. ✅ Run tests
2. ✅ Run TypeScript checks
3. ✅ Verify in browser
4. ✅ Update todo.md
5. ✅ Create checkpoint
6. ✅ Push to GitHub

### When Stuck
1. ✅ Ask for clarification
2. ✅ Check the rules
3. ✅ Think about the vision
4. ✅ Break into smaller steps
5. ✅ Keep going

### When Delivering
1. ✅ Provide clear status
2. ✅ List what's done
3. ✅ List what's next
4. ✅ Provide 3 actionable next steps
5. ✅ Ask for feedback

---

## 🔐 The Golden Rule

**Above all else:**

> "Don't stop until you're done. Think 100 steps ahead. Understand the big picture. Respect the user's preferences. Deliver results, not excuses."

**סטבי's Motto:** "עבודה מסודרת, יעילה, מחוברת עם הקשר לשאר הדברים, מתחברת ומפתחת את הפרונטת ומה צריך להוסיף באופן טבעי. בצורה החי נגישה, נוחה ולהוסיף רעיונות שהאם רלוונטי /הכרחיים. עד שסיימת הכל. ולא לעצור עד שסיימת."

Translation: "Organized, efficient work, connected to other things, developing the front-end naturally with what needs to be added. In a living, accessible, comfortable way with relevant/necessary ideas. Until you're done. And don't stop until you're done."

---

**This document is the constitution of how we work together. Reference it often. Follow it always.**
