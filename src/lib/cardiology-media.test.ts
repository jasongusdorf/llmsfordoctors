import { describe, expect, it } from 'vitest';
import { displayTitleFor, interpretationFor, sourceNameFor, type CardiologyMedia } from './cardiology-media';

const base: CardiologyMedia = { id:'x', title:'Study', description:'Example', modality:'Echocardiography', src:'/x.mp4', sourcePage:'https://example.com', creator:'Creator', license:'CC BY', licenseUrl:'https://example.com/license', changes:'Transcoded', mime:'video/mp4' };

describe('cardiology media interpretation', () => {
  it('provides modality-specific echo guidance', () => {
    const result = interpretationFor(base);
    expect(result.orientation).toContain('acoustic window');
    expect(result.checklist.length).toBeGreaterThanOrEqual(5);
  });

  it('adds diagnosis-specific findings without claiming severity', () => {
    const result = interpretationFor({...base, title:'Severe aortic stenosis'});
    expect(result.supportedFindings.join(' ')).toContain('Doppler');
    expect(result.pitfalls.join(' ')).toContain('hemodynamic');
  });

  it('keeps unlabeled studies within the evidence boundary', () => {
    const result = interpretationFor({...base, modality:'Cardiac MRI'});
    expect(result.clinicalMeaning).toContain('complete diagnostic study');
    expect(result.orientation).toContain('tissue characterization');
  });

  it('turns imported filenames into readable titles', () => {
    expect(displayTitleFor({...base, title:'Aortic dissection E00246 (CardioNetworks ECHOpedia)'})).toBe('Aortic dissection');
    expect(displayTitleFor({...base, title:'Cardiovascular-magnetic-resonance-in-pericardial-diseases-1532-429X-11-14-S2'})).toBe('Cardiovascular magnetic resonance in pericardial diseases');
  });

  it('uses useful descriptions for generic clip filenames and short source names', () => {
    expect(displayTitleFor({...base, title:'clip0005', description:'Four-chamber cine showing ventricular motion.'})).toBe('Four-chamber cine showing ventricular motion');
    expect(sourceNameFor({...base, category:'Wikimedia Commons · Echocardiography'})).toBe('Wikimedia Commons');
  });
});
