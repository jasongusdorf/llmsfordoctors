import { describe, expect, it } from 'vitest';
import { isImagingDue, updateImagingProgress } from './cardiology-imaging-progress';
describe('imaging progress',()=>{
 const now=new Date('2026-09-17T12:00:00Z');
 it('returns misses quickly',()=>{const r=updateImagingProgress(undefined,false,'high','x',now);expect(r.intervalDays).toBe(1);expect(r.errors.x).toBe(1)});
 it('spaces high-confidence correct reads',()=>{const r=updateImagingProgress(undefined,true,'high','x',now);expect(r.intervalDays).toBe(3);expect(r.correct).toBe(1)});
 it('detects due studies',()=>{expect(isImagingDue(undefined,now)).toBe(true);expect(isImagingDue({attempts:1,correct:1,intervalDays:1,dueAt:'2026-09-18T12:00:00Z',errors:{}},now)).toBe(false)});
});
