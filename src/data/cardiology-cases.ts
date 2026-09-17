export type CaseMode = 'board' | 'bedside' | 'rapid';

export type CaseStage = {
  title: string;
  reveal: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  errorTag: string;
  modes?: CaseMode[];
  media?: { type: 'ecg' | 'audio'; src: string; alt: string; href?: string };
};

export type CardiologyCase = {
  id: string;
  title: string;
  category: string;
  difficulty: 'Core' | 'Advanced';
  estimatedMinutes: number;
  opening: string;
  objectives: string[];
  stages: CaseStage[];
  synthesis: string;
  takeaways: string[];
  guidelineLinks: { label: string; href: string }[];
  textbookReferences: string[];
};

const guidelineLibrary = '/education/cardiology/guidelines';

export const cardiologyCases: CardiologyCase[] = [
  {
    id: 'inferior-occlusion-rv-infarct',
    title: 'Inferior occlusion with a pressure problem',
    category: 'Acute coronary syndrome',
    difficulty: 'Core',
    estimatedMinutes: 6,
    opening: 'A 64-year-old man has 50 minutes of crushing chest pressure, diaphoresis, and nausea. BP is 86/58 mm Hg, pulse 54/min, oxygen saturation 96% on room air. Lungs are clear; the jugular venous pressure is elevated.',
    objectives: ['Recognize an inferior occlusion pattern', 'Suspect right-ventricular involvement from bedside physiology', 'Choose reperfusion without a biomarker delay'],
    stages: [
      {
        title: 'Initial physiology', reveal: 'Clear lungs, hypotension, bradycardia, and elevated JVP are confirmed.',
        prompt: 'Which single mechanism best unifies these findings?',
        options: ['Isolated LV pump failure', 'Right-ventricular infarction', 'Papillary-muscle rupture', 'Vasodilatory shock'], answer: 1,
        explanation: 'Hypotension with systemic venous congestion and clear lungs localizes the dominant hemodynamic problem to the right ventricle. Inferior ischemia may also produce vagal activation or AV-nodal ischemia and bradycardia.', errorTag: 'shock phenotype', modes: ['board', 'bedside'],
      },
      {
        title: 'ECG', reveal: 'A 12-lead ECG is obtained immediately.', prompt: 'What is the principal ECG diagnosis?',
        options: ['Inferior myocardial infarction', 'Anterior myocardial infarction', 'Acute pericarditis', 'Left bundle branch block'], answer: 0,
        explanation: 'The tracing is drawn from the site’s validated inferior-MI collection. In the clinical vignette, obtain right-sided leads—especially V4R—to evaluate RV involvement and look for reciprocal change rather than waiting for troponin.', errorTag: 'occlusion recognition', modes: ['board', 'bedside', 'rapid'],
        media: { type: 'ecg', src: '/ecg-tracings/inferior-mi/02792.png', alt: '12-lead ECG from the inferior myocardial infarction library', href: '/education/cardiology/ecg/tracing/2792' },
      },
      {
        title: 'Action', reveal: 'The tracing and presentation establish an acute coronary occlusion syndrome.',
        prompt: 'What is the best next step?', options: ['Wait for serial troponins', 'Urgent reperfusion activation', 'Routine exercise stress testing', 'Give sublingual nitroglycerin and reassess'], answer: 1,
        explanation: 'Definitive reperfusion should be activated immediately. Nitrates can worsen preload-dependent hypotension in RV infarction. A cautious fluid challenge may support preload while the patient proceeds to reperfusion, but it is not definitive therapy.', errorTag: 'reperfusion', modes: ['board', 'bedside'],
      },
    ],
    synthesis: 'This is an inferior acute coronary occlusion with bedside evidence of right-ventricular involvement. The useful chain is territory → physiology → right-sided leads → immediate reperfusion.',
    takeaways: ['Clear lungs do not make shock benign.', 'Do not wait for biomarkers when the ECG and presentation establish occlusion.', 'Avoid reflex preload reduction in a hypotensive RV infarct.'],
    guidelineLinks: [{ label: '2025 ACC/AHA acute coronary syndromes', href: guidelineLibrary }, { label: '2023 ESC acute coronary syndromes', href: guidelineLibrary }],
    textbookReferences: ['Current Diagnosis and Treatment: Cardiology, 5th ed. (Crawford)', 'Cardiology Board Review: ECG, Hemodynamic and Angiographic Unknowns (Stouffer)'],
  },
  {
    id: 'atrial-fibrillation-unstable',
    title: 'An irregular rhythm and a falling pressure', category: 'Arrhythmia', difficulty: 'Core', estimatedMinutes: 5,
    opening: 'A 76-year-old woman with HFpEF develops abrupt dyspnea and palpitations. Pulse is irregular at approximately 165/min, BP 74/46 mm Hg, and she is confused with cool extremities.',
    objectives: ['Recognize atrial fibrillation', 'Separate rhythm diagnosis from stability', 'Choose synchronized cardioversion for instability'],
    stages: [
      { title: 'ECG', reveal: 'The rhythm strip is irregularly irregular with no consistent P waves.', prompt: 'What is the rhythm?', options: ['Atrial fibrillation', 'Atrial flutter with fixed block', 'Sinus tachycardia', 'Monomorphic VT'], answer: 0, explanation: 'Irregular ventricular activation without organized P waves is atrial fibrillation. The rate matters less initially than the evidence of shock.', errorTag: 'rhythm diagnosis', modes: ['board', 'bedside', 'rapid'], media: { type: 'ecg', src: '/ecg-tracings/atrial-fibrillation/04117.png', alt: '12-lead ECG showing atrial fibrillation', href: '/education/cardiology/ecg/tracing/4117' } },
      { title: 'Stability', reveal: 'Confusion, hypotension, and cool extremities persist.', prompt: 'What is the immediate rhythm treatment?', options: ['IV metoprolol', 'IV diltiazem', 'Synchronized cardioversion', 'Oral amiodarone'], answer: 2, explanation: 'A tachyarrhythmia with attributable hemodynamic instability requires synchronized cardioversion. Sedation is appropriate if feasible, but it must not delay shock.', errorTag: 'unstable arrhythmia', modes: ['board', 'bedside'] },
      { title: 'After stabilization', reveal: 'Sinus rhythm is restored and perfusion improves.', prompt: 'Which statement is most accurate?', options: ['Cardioversion eliminates future stroke risk', 'Anticoagulation is unnecessary if sinus rhythm persists', 'Stroke prevention still requires formal risk assessment', 'Aspirin is equivalent to a DOAC'], answer: 2, explanation: 'Restoration of sinus rhythm does not erase atrial thromboembolic risk. Anticoagulation decisions follow validated stroke-risk assessment, cardioversion timing, bleeding risk, and patient context.', errorTag: 'anticoagulation', modes: ['board', 'bedside'] },
    ],
    synthesis: 'The diagnostic move is AF; the lifesaving move is recognizing instability. Rhythm labels never outrank perfusion.',
    takeaways: ['Shock attributable to AF means synchronized cardioversion.', 'Do not let rate-control routines delay electricity.', 'Reassess thromboembolic prevention after stabilization.'],
    guidelineLinks: [{ label: '2023 ACC/AHA/ACCP/HRS atrial fibrillation', href: guidelineLibrary }, { label: '2024 ESC atrial fibrillation', href: guidelineLibrary }],
    textbookReferences: ['Cardiac Arrhythmias: Interpretation, Diagnosis and Treatment, 2nd ed. (Prystowsky and Klein)', 'Goldberger’s Clinical Electrocardiography'],
  },
  {
    id: 'aortic-stenosis-syncope', title: 'Exertional syncope and a harsh systolic murmur', category: 'Valvular disease', difficulty: 'Core', estimatedMinutes: 6,
    opening: 'A 78-year-old man reports progressive exertional dyspnea and one episode of syncope while climbing stairs. The carotid upstroke is delayed. A harsh crescendo–decrescendo systolic murmur radiates to both carotids.',
    objectives: ['Recognize severe aortic-stenosis physiology', 'Interpret the sound in context', 'Understand why symptoms change the intervention threshold'],
    stages: [
      { title: 'Auscultation', reveal: 'Listen to a representative recording from the heart-sound library.', prompt: 'Which lesion best fits the examination and sound?', options: ['Aortic stenosis', 'Mitral regurgitation', 'Hypertrophic cardiomyopathy', 'Ventricular septal defect'], answer: 0, explanation: 'The classic pattern is a systolic ejection murmur radiating to the carotids with pulsus parvus et tardus. HCM usually becomes louder with reduced preload and generally does not radiate to the carotids in the same way.', errorTag: 'murmur discrimination', modes: ['board', 'bedside', 'rapid'], media: { type: 'audio', src: '/audio/heart/aortic-stenosis-058.mp3', alt: 'Representative aortic stenosis recording' } },
      { title: 'Severity', reveal: 'TTE shows a calcified valve, peak velocity 4.4 m/s, mean gradient 48 mm Hg, and preserved LVEF.', prompt: 'How should this be classified?', options: ['Mild AS', 'Moderate AS', 'Severe high-gradient AS', 'Low-flow low-gradient AS'], answer: 2, explanation: 'A peak velocity at least 4.0 m/s or mean gradient at least 40 mm Hg supports severe high-gradient AS when measurements are internally consistent.', errorTag: 'valve severity', modes: ['board', 'bedside'] },
      { title: 'Decision', reveal: 'Symptoms are attributable to the valve lesion.', prompt: 'What is the appropriate next management pathway?', options: ['Annual observation only', 'Heart Team evaluation for valve replacement', 'Empiric nitrates', 'Balloon valvuloplasty as routine definitive therapy'], answer: 1, explanation: 'Symptomatic severe AS warrants evaluation for valve replacement. Choice of TAVR versus surgery depends on anatomy, age and longevity, procedural risk, concomitant disease, and patient preference.', errorTag: 'intervention timing', modes: ['board', 'bedside'] },
    ],
    synthesis: 'Symptoms plus severe high-gradient AS move the patient from surveillance to intervention planning.',
    takeaways: ['Murmur intensity alone does not grade severity.', 'Exertional syncope in severe AS is a high-stakes symptom.', 'The intervention decision is multidisciplinary and anatomy-specific.'],
    guidelineLinks: [{ label: '2025 ESC/EACTS valvular heart disease', href: guidelineLibrary }],
    textbookReferences: ['Essential Echocardiography: A Companion to Braunwald’s Heart Disease (Solomon and Wu)', 'Pocket Cardiology (Sabatine)'],
  },
  {
    id: 'hypertrophic-cardiomyopathy', title: 'A murmur that gets louder when the ventricle empties', category: 'Cardiomyopathy', difficulty: 'Advanced', estimatedMinutes: 6,
    opening: 'A 22-year-old competitive basketball player has exertional presyncope. His father died suddenly at 38. A systolic murmur at the left sternal border becomes louder with standing and during Valsalva.',
    objectives: ['Recognize dynamic LV outflow obstruction', 'Connect maneuvers to ventricular geometry', 'Start sudden-death risk assessment'],
    stages: [
      { title: 'Dynamic examination', reveal: 'The murmur decreases with squatting and increases with reduced preload.', prompt: 'Which mechanism best explains the finding?', options: ['Fixed valvular obstruction', 'Dynamic LV outflow-tract obstruction', 'Acute mitral-valve flail', 'Increased pulmonary flow'], answer: 1, explanation: 'Reduced LV cavity size increases systolic anterior motion and dynamic obstruction in obstructive HCM. Squatting increases preload and afterload, tending to reduce the gradient.', errorTag: 'dynamic maneuvers', modes: ['board', 'bedside'] },
      { title: 'ECG and sound', reveal: 'A representative HCM sound and an ECG with voltage criteria are reviewed.', prompt: 'Which diagnosis best integrates the family history, maneuvers, and findings?', options: ['Hypertrophic cardiomyopathy', 'Aortic stenosis', 'Athlete’s heart only', 'Pulmonic stenosis'], answer: 0, explanation: 'The combination of exertional symptoms, a premature family death, dynamic murmur behavior, and hypertrophic electrical phenotype requires evaluation for HCM rather than reassurance as physiologic adaptation.', errorTag: 'cardiomyopathy phenotype', modes: ['board', 'bedside', 'rapid'], media: { type: 'audio', src: '/audio/heart/hypertrophic-cardiomyopathy-037.mp3', alt: 'Representative hypertrophic cardiomyopathy recording' } },
      { title: 'Risk', reveal: 'Echo confirms asymmetric hypertrophy and dynamic obstruction.', prompt: 'What is the most important next framework?', options: ['Routine clearance for unrestricted sport', 'Sudden-death risk assessment and shared decision-making', 'Empiric dual antiplatelet therapy', 'No family evaluation unless symptoms develop'], answer: 1, explanation: 'Management includes symptom treatment, sudden-death risk assessment, exercise counseling through shared decision-making, and genetic/family evaluation when appropriate.', errorTag: 'sudden death risk', modes: ['board', 'bedside'] },
    ],
    synthesis: 'The bedside maneuver is not trivia: it reveals a dynamic obstruction and identifies a patient who needs structured HCM and sudden-death evaluation.',
    takeaways: ['Standing and Valsalva shrink the LV and can intensify HCM obstruction.', 'A family history of premature sudden death changes the stakes.', 'Athlete’s heart is a diagnosis reached after appropriate evaluation, not before it.'],
    guidelineLinks: [{ label: '2024 AHA/ACC hypertrophic cardiomyopathy', href: guidelineLibrary }, { label: '2023 ESC cardiomyopathies', href: guidelineLibrary }],
    textbookReferences: ['Current Diagnosis and Treatment: Cardiology, 5th ed. (Crawford)', 'Cardiology Board Review (Pai and Varadarajan)'],
  },
  {
    id: 'complete-heart-block', title: 'Syncope with AV dissociation', category: 'Bradyarrhythmia', difficulty: 'Core', estimatedMinutes: 5,
    opening: 'An 81-year-old man has recurrent abrupt syncope. Pulse is 31/min and regular; BP is 82/50 mm Hg. Cannon a waves are intermittently visible in the neck.',
    objectives: ['Recognize complete AV block', 'Connect cannon a waves to AV dissociation', 'Choose immediate pacing support'],
    stages: [
      { title: 'ECG', reveal: 'P waves and QRS complexes march independently.', prompt: 'What is the diagnosis?', options: ['First-degree AV block', 'Mobitz I block', 'Complete heart block', 'Sinus bradycardia'], answer: 2, explanation: 'Independent atrial and ventricular rhythms establish complete AV block. Cannon a waves occur when the atrium contracts against a closed tricuspid valve.', errorTag: 'conduction diagnosis', modes: ['board', 'bedside', 'rapid'], media: { type: 'ecg', src: '/ecg-tracings/third-degree-av-block/10505.png', alt: '12-lead ECG from the complete heart block library', href: '/education/cardiology/ecg/tracing/10505' } },
      { title: 'Immediate support', reveal: 'The patient remains hypotensive and confused.', prompt: 'What is the best immediate management?', options: ['Outpatient patch monitor', 'Pacing preparation with temporizing chronotropic support', 'IV diltiazem', 'Exercise testing'], answer: 1, explanation: 'Unstable high-grade bradycardia requires immediate pacing capability. Atropine may fail in infranodal block; transcutaneous pacing or chronotropic infusion can bridge to transvenous and definitive pacing as indicated.', errorTag: 'bradycardia stabilization', modes: ['board', 'bedside'] },
      { title: 'Cause', reveal: 'Medication review and ischemia/electrolyte evaluation are underway.', prompt: 'Which principle should guide permanent pacing?', options: ['Implant before considering reversibility', 'Exclude reversible causes while maintaining safe support', 'Wait for another syncopal event', 'Use an ICD for every complete block'], answer: 1, explanation: 'Safety comes first, but reversible causes—ischemia, drugs, metabolic disorders, infection, and procedural injury—must be assessed. Persistent acquired complete block without a reversible cause generally warrants permanent pacing.', errorTag: 'device indication', modes: ['board', 'bedside'] },
    ],
    synthesis: 'AV dissociation explains the ECG, cannon a waves, bradycardia, and syncope. Stabilize first, then distinguish reversible from persistent disease.',
    takeaways: ['Cannon a waves are a mechanical clue to electrical dissociation.', 'Atropine is not reliable for distal block.', 'Temporary support and etiologic evaluation occur in parallel.'],
    guidelineLinks: [{ label: '2021 ESC cardiac pacing and CRT', href: guidelineLibrary }],
    textbookReferences: ['The EHRA Book of Interventional Electrophysiology', 'Cardiac Arrhythmias: Interpretation, Diagnosis and Treatment, 2nd ed.'],
  },
  {
    id: 'post-mi-acute-mitral-regurgitation', title: 'Pulmonary edema after myocardial infarction', category: 'Mechanical complication', difficulty: 'Advanced', estimatedMinutes: 7,
    opening: 'Three days after an inferior MI, a 69-year-old woman develops sudden respiratory distress and shock. A new systolic murmur is present, but it is softer than expected. CXR shows asymmetric pulmonary edema.',
    objectives: ['Recognize acute severe MR after MI', 'Understand why an acute severe murmur may be soft', 'Escalate to urgent imaging and intervention'],
    stages: [
      { title: 'Mechanism', reveal: 'The deterioration is abrupt after a seemingly stable interval.', prompt: 'Which complication is most likely?', options: ['Papillary-muscle rupture with acute MR', 'Chronic functional MR', 'Dressler syndrome', 'Stable ventricular aneurysm'], answer: 0, explanation: 'Papillary-muscle rupture is a catastrophic post-MI mechanical complication, classically following inferior infarction. Acute MR causes rapid left-atrial pressure rise, pulmonary edema, and shock.', errorTag: 'mechanical complication', modes: ['board', 'bedside'] },
      { title: 'Auscultation', reveal: 'A representative MR recording is provided; the clinical murmur remains unimpressive.', prompt: 'Why can acute severe MR be relatively soft?', options: ['Regurgitation is never turbulent', 'LV and LA pressures equalize rapidly', 'The mitral valve closes normally', 'Pulmonary edema dampens all murmurs'], answer: 1, explanation: 'A large acute regurgitant orifice can rapidly equalize LV and LA pressures, shortening and softening the murmur. Murmur loudness must not overrule shock physiology.', errorTag: 'murmur severity', modes: ['board', 'bedside', 'rapid'], media: { type: 'audio', src: '/audio/heart/mitral-regurgitation-004.mp3', alt: 'Representative mitral regurgitation recording' } },
      { title: 'Action', reveal: 'The patient is hypoxemic and requires vasopressor support.', prompt: 'What is the best next pathway?', options: ['Routine outpatient TTE', 'Urgent echo, surgical/structural consultation, and stabilization', 'Diuresis alone', 'Empiric thrombolysis'], answer: 1, explanation: 'Urgent echocardiography—often with TEE if TTE is inadequate—defines the lesion while the team stabilizes oxygenation and perfusion and mobilizes definitive intervention. Medical treatment is a bridge, not the endpoint.', errorTag: 'mechanical complication action', modes: ['board', 'bedside'] },
    ],
    synthesis: 'The post-MI clock plus sudden edema and shock should trigger a mechanical-complication reflex even when the murmur is not dramatic.',
    takeaways: ['Acute severe regurgitation can be quiet.', 'Asymmetric edema can occur with an eccentric MR jet.', 'Definitive mechanical treatment must be mobilized early.'],
    guidelineLinks: [{ label: '2025 ACC/AHA acute coronary syndromes', href: guidelineLibrary }, { label: '2025 ESC/EACTS valvular heart disease', href: guidelineLibrary }],
    textbookReferences: ['Case Reports in Cardiology: Valvular Heart Disease (Roberts)', 'Atlas of Cardiovascular Emergencies (Lefebvre and O’Neill)'],
  },
  {
    id: 'high-risk-pulmonary-embolism', title: 'Shock with a dilated right ventricle', category: 'Pulmonary vascular disease', difficulty: 'Advanced', estimatedMinutes: 6,
    opening: 'A 58-year-old woman seven days after hip surgery develops abrupt dyspnea and syncope. BP is 72/44 mm Hg, pulse 128/min, JVP is elevated, and lungs are clear. POCUS shows a dilated, hypokinetic RV without pericardial effusion.',
    objectives: ['Recognize obstructive shock from PE', 'Avoid overinterpreting nonspecific ECG patterns', 'Choose an emergency reperfusion pathway'],
    stages: [
      { title: 'Shock phenotype', reveal: 'There is systemic venous congestion, a failing RV, and no left-sided congestion.', prompt: 'What is the leading mechanism?', options: ['Massive pulmonary embolism', 'Isolated LV infarction', 'Hypovolemic shock', 'Acute aortic regurgitation'], answer: 0, explanation: 'The perioperative context, abrupt presentation, clear lungs, high JVP, and acute RV failure define an obstructive-shock pattern highly concerning for PE.', errorTag: 'shock phenotype', modes: ['board', 'bedside'] },
      { title: 'ECG', reveal: 'The ECG shows sinus tachycardia with right-sided conduction abnormalities.', prompt: 'Which statement is most accurate?', options: ['A normal ECG excludes PE', 'RBBB proves PE', 'ECG can support RV strain but is neither sensitive nor specific', 'S1Q3T3 is required for diagnosis'], answer: 2, explanation: 'ECG findings in PE are variable. Sinus tachycardia is common; RBBB, right-axis deviation, anterior T-wave inversion, or S1Q3T3 may support RV strain, but none is diagnostic.', errorTag: 'test interpretation', modes: ['board', 'bedside', 'rapid'], media: { type: 'ecg', src: '/ecg-tracings/crbbb/03461.png', alt: 'Representative ECG with complete right bundle branch block', href: '/education/cardiology/ecg/tracing/3461' } },
      { title: 'Action', reveal: 'The patient remains in shock and PE is the working diagnosis.', prompt: 'What is the correct management principle?', options: ['Delay treatment until a routine outpatient scan', 'Activate an emergency reperfusion pathway while confirming diagnosis as safely as possible', 'Give a large unmonitored fluid bolus', 'Treat with a beta blocker'], answer: 1, explanation: 'High-risk PE with shock requires immediate multidisciplinary reperfusion decision-making. Systemic thrombolysis, catheter-based therapy, or surgical embolectomy depends on contraindications, availability, and patient factors; confirmation must not create a dangerous delay.', errorTag: 'pe reperfusion', modes: ['board', 'bedside'] },
    ],
    synthesis: 'This is obstructive shock from probable high-risk PE. The ECG is supporting context; the hemodynamic phenotype drives urgency.',
    takeaways: ['Clear lungs plus high JVP and shock should trigger an RV/obstructive differential.', 'No single ECG sign rules PE in or out.', 'Large fluid loads can worsen RV dilation and output.'],
    guidelineLinks: [{ label: '2026 ACC/AHA acute pulmonary embolism', href: guidelineLibrary }, { label: '2022 ESC/ERS pulmonary hypertension', href: guidelineLibrary }],
    textbookReferences: ['Atlas of Cardiovascular Emergencies (Lefebvre and O’Neill)', 'Pocket Cardiology (Sabatine)'],
  },
  {
    id: 'wpw-preexcited-af', title: 'An irregular wide-complex tachycardia', category: 'Electrophysiology', difficulty: 'Advanced', estimatedMinutes: 6,
    opening: 'A 29-year-old man with episodic palpitations presents with an irregular wide-complex tachycardia at rates varying from 190 to 260/min. He is alert but diaphoretic; BP is 98/62 mm Hg.',
    objectives: ['Recognize pre-excited AF as a dangerous possibility', 'Avoid isolated AV-nodal blockade', 'Know when electricity is the safest strategy'],
    stages: [
      { title: 'Baseline substrate', reveal: 'A prior resting ECG is available.', prompt: 'Which substrate is shown?', options: ['Ventricular pre-excitation', 'Complete heart block', 'Anterior MI', 'Long QT syndrome'], answer: 0, explanation: 'A short PR interval and delta wave indicate ventricular pre-excitation through an accessory pathway. This matters dramatically when AF occurs.', errorTag: 'preexcitation', modes: ['board', 'bedside', 'rapid'], media: { type: 'ecg', src: '/ecg-tracings/wpw/02145.png', alt: '12-lead ECG showing ventricular pre-excitation', href: '/education/cardiology/ecg/tracing/2145' } },
      { title: 'Dangerous rhythm', reveal: 'The current rhythm is irregular, very rapid, and wide, with beat-to-beat variation in QRS morphology.', prompt: 'Which treatment should be avoided?', options: ['Synchronized cardioversion when unstable', 'Procainamide in an appropriate stable patient', 'Expert electrophysiology input', 'Isolated AV-nodal blockade'], answer: 3, explanation: 'AV-nodal blockers can favor conduction down the accessory pathway in pre-excited AF and precipitate ventricular fibrillation. Avoid adenosine, beta blockers, nondihydropyridine calcium-channel blockers, and digoxin in this scenario.', errorTag: 'dangerous medication', modes: ['board', 'bedside'] },
      { title: 'Instability', reveal: 'His pressure falls to 70/40 mm Hg and mental status deteriorates.', prompt: 'What is the best immediate treatment?', options: ['Observe for spontaneous conversion', 'Synchronized cardioversion', 'Oral beta blocker', 'Carotid massage'], answer: 1, explanation: 'Hemodynamic instability makes synchronized cardioversion the immediate treatment regardless of the precise wide-complex mechanism.', errorTag: 'unstable arrhythmia', modes: ['board', 'bedside'] },
    ],
    synthesis: 'An irregular, extremely rapid, wide-complex rhythm plus pre-excitation is pre-excited AF until proved otherwise. The key error to avoid is AV-nodal blockade.',
    takeaways: ['Irregular wide tachycardia has a dangerous differential.', 'Pre-excited AF can deteriorate into VF.', 'When unstable, choose synchronized cardioversion.'],
    guidelineLinks: [{ label: '2023 ACC/AHA/ACCP/HRS atrial fibrillation', href: guidelineLibrary }, { label: '2022 ESC ventricular arrhythmias and SCD', href: guidelineLibrary }],
    textbookReferences: ['The EHRA Book of Interventional Electrophysiology', 'Electrocardiography of Arrhythmias: A Comprehensive Review (Das and Zipes)'],
  },
];
