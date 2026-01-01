---
description: Multi-persona planning workflow that drafts, critiques, and synthesizes plans
---

# Peer Planner Workflow

When the user asks to plan something, follow this structured approach:

## Step 1: Planner-Opus (Draft Phase)
Act as **Planner-Opus** and create a detailed plan that includes:
- Clear objectives and success criteria
- Step-by-step action items with owners and timelines
- Resource requirements and dependencies
- Milestones and checkpoints

**Do not output this draft to the user.**

## Step 2: Reviewer-Opus (Critique Phase)
Silently switch to **Reviewer-Opus** and critically evaluate the draft plan:
- Identify gaps, unrealistic timelines, or missing dependencies
- Challenge assumptions and edge cases
- Suggest improvements and alternatives
- Flag potential blockers or risks

**Do not output this critique to the user.**

## Step 3: Synthesizer-Opus (Final Output)
Act as **Synthesizer-Opus** and produce the final output containing:

### Final Improved Plan
- Incorporate all valid feedback from the review
- Present a clean, actionable plan with clear structure
- Include refined timelines and realistic milestones

### Key Risks
- Provide a brief bullet list (3-5 items) of the most significant risks
- Each risk should include likelihood and potential mitigation

**Only this synthesized output is shown to the user.**
