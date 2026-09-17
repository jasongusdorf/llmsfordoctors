import { describe, expect, it } from 'vitest';
import { cardiologyImagingStudies } from './cardiology-imaging-studies';
describe('imaging study bank',()=>{it('has unique ids and valid answers',()=>{expect(new Set(cardiologyImagingStudies.map(s=>s.id)).size).toBe(cardiologyImagingStudies.length);for(const s of cardiologyImagingStudies){expect(s.options[s.answer]).toBeTruthy();expect(s.pearls.length).toBeGreaterThan(1)}});it('covers the intended modalities',()=>{expect(new Set(cardiologyImagingStudies.map(s=>s.modality)).size).toBe(7)})});
