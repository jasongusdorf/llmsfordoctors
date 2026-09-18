export type CardiologyMedia = {
  id: string; title: string; description: string; modality: string; category?: string;
  src: string; sourcePage: string; creator: string; credit?: string; license: string;
  licenseUrl: string; changes: string; width?: number; height?: number; mime: string;
  mediaKind?: string; poster?: string;
};

export type MediaInterpretation = {
  orientation: string;
  checklist: string[];
  supportedFindings: string[];
  clinicalMeaning: string;
  pitfalls: string[];
};

const diseaseGuides: Array<{match: RegExp; findings: string[]; meaning: string; pitfalls: string[]}> = [
  { match:/aortic stenosis|stenotic aortic/i, findings:['Assess cusp opening and calcification, then look for secondary LV hypertrophy and systolic consequences.','Severity cannot be assigned from morphology alone; it requires Doppler velocity/gradient, valve area, flow state, and clinical concordance.'], meaning:'The moving anatomy can support the mechanism of fixed LV outflow obstruction, but the cine is one component of a complete valve assessment.', pitfalls:['Do not infer severe AS from restricted-looking leaflets without hemodynamic measurements.'] },
  { match:/hypertrophic|HCM|LVOT|systolic anterior motion/i, findings:['Look for asymmetric hypertrophy, systolic anterior motion of the mitral valve, mitral–septal contact, and associated posteriorly directed MR.','Compare chamber size and wall thickening through the cardiac cycle.'], meaning:'These features can support hypertrophic cardiomyopathy and dynamic obstruction; provocation and Doppler establish the physiologic burden.', pitfalls:['Do not diagnose HCM from apparent wall thickness in an off-axis view.','A cine cannot provide an LVOT gradient.'] },
  { match:/mitral regurg|flail mitral|mitral prolapse|papillary/i, findings:['Identify leaflet motion, coaptation failure, flail or prolapsing segments, and the direction of any color-flow jet when Doppler is present.','Look for LV and LA remodeling, recognizing that acute severe MR may precede chamber enlargement.'], meaning:'Morphology localizes the mechanism of regurgitation; severity requires an integrated Doppler and chamber-response assessment.', pitfalls:['Jet area alone is not a severity measure.','Eccentric wall-hugging jets are easily underestimated.'] },
  { match:/aortic regurg|aortic insuff/i, findings:['Inspect cusp coaptation and, if color Doppler is present, the origin and direction of diastolic regurgitant flow.','Assess LV size and function for chronic volume-overload consequences.'], meaning:'The study can demonstrate the regurgitant mechanism, but severity requires multiparametric Doppler assessment and clinical context.', pitfalls:['Do not grade AR from a single color jet or cine plane.'] },
  { match:/tricuspid regurg/i, findings:['Look for incomplete tricuspid coaptation, annular dilation, RV/RA enlargement, and systolic hepatic-vein flow reversal when spectral Doppler is available.'], meaning:'The cine may establish mechanism and right-heart consequences; severity remains multiparametric.', pitfalls:['Loading conditions can substantially change apparent TR severity.'] },
  { match:/tamponade|pericardial effusion/i, findings:['Identify the distribution and size of pericardial fluid, right-atrial systolic collapse, right-ventricular early-diastolic collapse, and IVC plethora.','Respiratory Doppler variation and the bedside hemodynamic picture determine physiologic significance.'], meaning:'Echo findings support tamponade physiology; tamponade itself is a clinical-hemodynamic diagnosis.', pitfalls:['A large effusion is not synonymous with tamponade.','Positive-pressure ventilation alters expected respiratory findings.'] },
  { match:/pulmonary embol|RV strain|right ventricular dysfunction|pulmonary hypertension/i, findings:['Compare RV with LV size, inspect RV free-wall motion and septal shape, and assess right-atrial size and TR when visible.','Look for pressure-overload signs rather than relying on any single named sign.'], meaning:'Right-heart abnormalities can support pressure overload but do not identify its cause by themselves.', pitfalls:['McConnell-type regional motion is not specific for acute PE.','Chronic pulmonary hypertension can mimic acute RV strain.'] },
  { match:/dilated cardiomy|heart failure|reduced ejection|HFrEF/i, findings:['Assess global LV size and systolic thickening, regional versus global dysfunction, RV involvement, and functional MR.','Estimate function across multiple views rather than from one dramatic frame.'], meaning:'The cine demonstrates ventricular phenotype; etiology requires coronary, valvular, rhythm, genetic, toxic, and inflammatory assessment.', pitfalls:['Visual EF from one view is imprecise.','Foreshortening can make the apex and LV volumes misleading.'] },
  { match:/amyloid/i, findings:['Look for increased wall thickness, small ventricular cavity, biatrial enlargement, valve thickening, and pericardial effusion.','On CMR, tissue characterization—not cine morphology alone—is central.'], meaning:'Morphology may raise suspicion for an infiltrative phenotype but does not establish amyloidosis.', pitfalls:['Hypertension and HCM can produce similar wall thickening.'] },
  { match:/sarcoid/i, findings:['Evaluate global and regional function, focal thinning or aneurysm, and RV involvement.','CMR diagnosis depends heavily on edema and late-gadolinium enhancement sequences, which may not be represented in a cine loop.'], meaning:'Cine abnormalities can localize dysfunction but cannot establish active cardiac sarcoidosis.', pitfalls:['A normal cine does not exclude cardiac sarcoidosis.'] },
  { match:/arrhythmogenic|dysplasia|ARVC/i, findings:['Assess RV size, global function, and regional akinesia, dyskinesia, or aneurysm; also inspect LV involvement.'], meaning:'Motion abnormalities contribute to an arrhythmogenic cardiomyopathy evaluation but must be interpreted within formal imaging, ECG, rhythm, family, and genetic criteria.', pitfalls:['Normal RV variants and off-axis imaging can mimic regional dyskinesia.'] },
  { match:/myocardial infarct|infarction|ischemi/i, findings:['Look for regional wall-motion abnormality in a coronary distribution, wall thinning, aneurysm, or mechanical complication.','On CMR, cine function and late-gadolinium enhancement answer different questions.'], meaning:'Regional dysfunction may support ischemic injury; scar, edema, perfusion, and coronary anatomy determine acuity and etiology.', pitfalls:['Wall-motion abnormality is not specific for acute infarction.'] },
  { match:/endocarditis|vegetation|abscess/i, findings:['Inspect valve surfaces for independently mobile masses, leaflet destruction, perforation, regurgitation, and peri-annular complications.'], meaning:'A compatible moving lesion can support infective endocarditis, but microbiology, pretest probability, and a complete TTE/TEE examination remain essential.', pitfalls:['Artifacts, Lambl excrescences, thrombus, and degenerative tissue can mimic vegetation.'] },
  { match:/dissection/i, findings:['Look for an intimal flap separating true and false lumens, aortic regurgitation, pericardial effusion, and branch-vessel involvement when the field of view permits.'], meaning:'A demonstrated flap is a high-risk structural finding requiring complete aortic imaging and urgent clinical integration.', pitfalls:['Motion artifact in the ascending aorta can mimic a flap.'] },
  { match:/septal defect|\bASD\b|\bVSD\b|shunt|Gerbode/i, findings:['Define the defect location and relationship to valves, then use color and spectral Doppler to establish flow direction and velocity when available.','Assess chamber enlargement as evidence of hemodynamic consequence.'], meaning:'Anatomic visualization identifies a possible communication; shunt magnitude and significance require Doppler, oximetry, or cross-sectional quantification.', pitfalls:['Color dropout can mimic a defect, while suboptimal alignment can conceal one.'] },
];

export function interpretationFor(item: CardiologyMedia): MediaInterpretation {
  const text = `${item.title} ${item.description}`;
  const isCmr = /MRI|magnetic/i.test(item.modality);
  const isEcho = /echo|ultrasound/i.test(item.modality);
  const orientation = isCmr
    ? 'First identify the cine plane (short axis, two-/three-/four-chamber, or outflow view), then track chamber motion from end-diastole through end-systole. This appears to be a cine sequence; tissue characterization requires the corresponding T1/T2, perfusion, or late-gadolinium series.'
    : isEcho
      ? 'First name the acoustic window and view, then confirm orientation and image quality before interpreting anatomy. Sweep through the loop more than once: chambers and valves first, global function second, then the focal abnormality.'
      : 'Identify the modality, projection, anatomic orientation, and phase of acquisition before assigning a finding. Compare the visible structure with the source label and note what lies outside the field of view.';
  const checklist = isCmr
    ? ['Name the plane and sequence type.','Compare LV and RV size and systolic motion.','Separate global from regional dysfunction.','Inspect valves, septa, pericardium, and great vessels that are visible.','State which tissue-characterization or flow data are missing.']
    : isEcho
      ? ['Name the window/view and judge adequacy.','Assess chamber size and global systolic function.','Inspect valve morphology and motion.','Look for regional wall-motion, septal, pericardial, and great-vessel abnormalities.','Use Doppler measurements—not appearance alone—for hemodynamic severity.']
      : ['Name the projection and anatomy.','Describe the visible abnormality before naming a diagnosis.','Look for secondary chamber or vascular consequences.','State the additional views or measurements needed.'];
  const guide = diseaseGuides.find(entry=>entry.match.test(text));
  return {
    orientation,
    checklist,
    supportedFindings: guide?.findings ?? ['The source identifies this asset as the finding described above. The available record does not provide enough adjudicated measurements to make a more specific patient-level interpretation.','Use the loop to practice systematic description, then return to the original source for the complete case and acquisition context.'],
    clinicalMeaning: guide?.meaning ?? 'This is a teaching example rather than a complete diagnostic study. Its value is pattern recognition; clinical conclusions require the full examination, measurements, and patient context.',
    pitfalls: guide?.pitfalls ?? ['Do not infer severity, acuity, or etiology from a single selected loop.','The source label has not been independently adjudicated by this site.'],
  };
}
