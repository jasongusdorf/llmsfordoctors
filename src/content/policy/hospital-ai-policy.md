---
title: "Seven Principles for a Hospital AI Policy"
description: "Recommended policy for hospitals and departments adopting clinical AI: seven principles, each with its rationale. Personal opinions, not those of any institution."
tags: [policy, governance, hipaa, deskilling, medical-education, disclosure, clinical-ai]
lastUpdated: 2026-09-05
featured: true
socialPost: "Most hospital AI policy is either a blanket ban or a vendor pamphlet. Seven principles I would want my own department to adopt, each with its rationale, including the case against mandatory AI disclosure and the case for using these tools to get back to the bedside."
---


Most hospital AI policy today comes in one of two forms. The first is the blanket ban, written by people who fear the technology and enforced against people already using it, which drives use underground where no one can see it, audit it, or teach it. The second is the vendor pamphlet, a procurement document dressed as governance, which tells you what a product does and nothing about what your clinicians should do. Neither survives contact with a Tuesday afternoon on the wards, where a resident is drafting a discharge summary with one tool, a patient is arriving with a chatbot transcript, and an ambient scribe is listening to the encounter next door.

Clinical AI is already in your building. The question a policy has to answer is not whether to allow it but how to make its use visible, competent, and owned by the people who sign their names to the work. The seven principles below are the ones I would want my own department to adopt. They are short on ceremony and long on responsibility.

**A note on whose opinions these are.** These are mine. I am a hospitalist and an AI researcher, and this document reflects what I have learned building and evaluating these systems. It is not the policy of Weill Cornell Medicine or NewYork-Presbyterian, and nothing here speaks for my employer. Where your institution's actual policy differs from my advice, your institution's policy wins, and you should know what it says.

## 1. Your content is your responsibility regardless of AI use.

A signature has always meant the same thing: the person signing attests that the content is accurate and stands behind it. Nothing about machine drafting weakens that. A note drafted by an ambient scribe and signed by you is your note, exactly as binding as one you typed at midnight, and it will be read as your account by every clinician, auditor, attorney, and patient who later opens the chart. The draft has no standing; your signature has all of it.

AI errors are not the errors clinicians are trained to catch. Generated drafts fail quietly: the negation that flips ("no chest pain" for the patient who described exertional pressure), the dropped allergy, the plausible dose that is wrong, the history the patient never gave. A fluent, complete-looking draft is easier to sign unread than a blank page is to fill unthinking, so the obligation is heavier, not lighter. The practical policy: read every AI-assisted draft against your own memory of the encounter before signing, with specific attention to negations, laterality, medications, and numbers, and check for what is missing, not only what is wrong. Every principle that follows depends on this one.

## 2. Know the skills critical to your discipline, and do not let heavy AI use erode them.

Every specialty has a small set of skills that define it, and those skills are maintained by practice, not by credentials. A tool that performs the skill for you removes the practice, and the erosion is measurable. In the most discussed example to date, endoscopists who worked for months with AI-assisted polyp detection showed a significant drop in their unaided adenoma detection rate when the tool was absent (Budzyn and colleagues, Lancet Gastroenterology and Hepatology, 2025, a retrospective study across four Polish endoscopy centers). These were experienced operators. The tool did not take their skill; the changed practice pattern did, because no one had decided in advance what the humans would keep doing unassisted.

The policy consequence is a deliberate inventory, by department, of the skills that must survive: the differential built from a blank page, the independent read of the film or the tracing before opening the AI overlay, the physical examination that does not defer to the risk score. Aviation solved this problem by mandating hand-flying, and medicine can borrow the answer rather than relearn it. Offload the toil freely. Protect the reasoning and the perception on purpose, in writing, as a departmental norm rather than an individual act of discipline.

## 3. Strongly recommend training in the biases and failure modes of AI, including hallucination.

We credential clinicians before they touch a ventilator; we should expect basic competence before they act on a language model. The failure modes are learnable, and none of them are intuitive. Hallucination alone is three different problems: a model can misreport a document it was given, invent facts when it has no source, and fail to say "I do not know" when it should. These vary independently, which is why published hallucination rates for the same model can differ by an order of magnitude. A confident answer with a real-looking citation is the output that most needs checking, because the dominant citation failure is not the fabricated reference but the real reference that does not say what the model claims.

Two other lessons belong in every curriculum. First, models are tuned toward agreeableness, so they tend to return your own hypothesis to you, polished, and the polish feels like confirmation when no information was added. Second, predictive tools inherit the biases of their training labels, so a model can perform well on its proxy while systematically underserving the patients the proxy undercounts. Training does not need to be long. It needs to be specific, clinical, and honest about where these tools are genuinely excellent, because a warning label with no acknowledged upside teaches clinicians to ignore the label.

## 4. Protected health information goes only into institutionally approved, HIPAA-compliant AI, under a business associate agreement.

This is the one principle that is a rule rather than a judgment, and it is narrower than it first sounds. The restriction attaches to the data, not to the tool. Use whatever model you prefer to draft a lecture, summarize a published guideline, work through a mechanism you have half forgotten, or argue with you about a paper, because none of that is anyone's health information. The line is crossed the moment a patient enters the prompt, and from that moment only an approved tool will do.

The legal object that matters is the business associate agreement, the contract that binds a vendor handling protected health information to HIPAA's requirements and forbids it from using your patients' data for its own purposes, including model training. A tool under a BAA is a permitted environment for PHI. A tool without one is not, no matter how capable, and capability is usually what tempts people across the line.

The act that creates exposure is small and concrete: the paste. A note, a lab, a portal message, a photograph of a wound, a screenshot of the monitor. The moment it enters a consumer chatbot it has left your institution's control and falls under that product's ordinary terms of service. Clinicians should also understand that the consumer and enterprise versions of the same product are different environments, and that the sign-in, not the interface, makes the instance institutional. Leadership owns half of this principle. Shadow AI, the quiet routing of patient information through unapproved tools, is not cured by exhortation. It is cured by providing an approved tool good enough that no one needs to work around it, and by making the approved list easy to find at the moment of temptation.

## 5. Know how your trainees are using AI, and teach them to use it for building clinical reasoning.

Expertise is built by doing the hard cognitive work while it is still hard: constructing a differential from nothing, committing to a plan, being wrong, and finding out why. A model will happily do that work for the trainee, and the cost is invisible for years. For an attending the risk is deskilling, the erosion of a skill once held. For a trainee the risk is worse, and it deserves its own name: never-skilling. The skill is not lost; it was never built, and there is no baseline to recover.

The teachable discipline is commit-first. The trainee writes the differential, the plan, or the read before consulting the model, then uses the output as a check. Same tool, opposite educational outcome: asked first, the model replaces the reasoning; asked second, it audits the reasoning and occasionally teaches. Supervisors should ask not only whether a trainee's AI-assisted answer is right but whether the trainee is still doing the work that builds unassisted judgment, and programs should keep some assessments AI-free so that competence is measured rather than assumed. An attending who co-signs a trainee's AI-assisted note owns it fully, which makes trainee AI practice a supervisory responsibility rather than a private choice.

## 6. Disclosure is not required, because your output is your responsibility either way.

This is the principle most likely to be misread. A disclosure requirement is an information system: the label is supposed to tell the reader something that changes how they read. That works only while AI use is the exception. When drafting assistance is embedded in the EHR, the dictation system, the literature search, and the inbox, a disclosure fires on essentially every document, and a signal that fires on everything carries no information. No one discloses spellcheck, the calculator, or the phone call to a colleague, and within a few years AI assistance will sit in the same category of ambient instrument. Mandating disclosure then produces ritual text that readers skip, and worse, it implies that undisclosed work is unassisted, a claim that will usually be false.

What actually protects patients is principle 1. Responsibility does not dilute with the tools used; the signer owns every word, however it was drafted, and accountability that travels with the signature scales in a way that labeling cannot. One boundary keeps this honest: where a law, a journal, or your institution imposes a specific disclosure requirement, that rule governs its own domain. Within the hospital's own policy, require ownership, not confession.

## 7. Use AI to improve patient care and patient relationships.

The first six principles are constraints, and a policy that is all constraint teaches avoidance rather than competence. This one is permission. Many physicians, often the most conscientious, feel a quiet embarrassment about using AI, a sense that the work no longer fully counts as theirs. That feeling deserves an argument rather than reassurance, and the argument is that the shame attaches to the wrong object: the tool, when everything that matters is in the outcome. We have never called it cheating to reach for a calculator, a guideline, a look at UpToDate before rounds, or a colleague's second opinion in the hallway. The obligation was never to work unaided. It was to get it right, and principle 1 already settles who owns the result.

The payoff worth claiming deliberately is time, and what the time is for. Documentation is the burden most plausibly given back, and the hours it returns are not for throughput. They are for the bedside: the family meeting, the chair pulled up, the question you would not otherwise have had time to ask. None of this happens by default; it happens with practice, the way facility with any clinical instrument does. Do this, get good at it, and use it to be a better doctor.

## The through-line

The seventh principle is the reason to accept the other six. Together they are one idea: the tool has no stake, and the clinician does. A model does not answer the 2 a.m. phone call, sit with the family, or carry the error forward. Whatever the technology does well, and it now does a great deal well, the weighing of consequence cannot be delegated. Good policy governs people, not software: it keeps their skills alive, their data inside the walls, their trainees growing, and their hands free for the work only a person at the bedside can do.
