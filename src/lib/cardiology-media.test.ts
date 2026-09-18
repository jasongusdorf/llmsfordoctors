import { describe, expect, it } from 'vitest';
import { interpretationFor, type CardiologyMedia } from './cardiology-media';

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
});
