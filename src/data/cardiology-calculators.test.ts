import { describe, expect, it } from 'vitest';
import { cardiologyCalculators, cardiologyPathways } from './cardiology-calculators';
describe('cardiology calculators',()=>{
 it('ships eight unique calculators',()=>{expect(cardiologyCalculators).toHaveLength(8);expect(new Set(cardiologyCalculators.map(c=>c.id)).size).toBe(8)});
 it('has usable scoring metadata',()=>{for(const c of cardiologyCalculators){expect(c.interpret(0)).toBeTruthy();expect(c.caveat.length).toBeGreaterThan(20);if(c.id!=='duke')expect(c.inputs.length).toBeGreaterThan(4)}});
 it('includes valve, HF, and AF pathways',()=>{expect(cardiologyPathways).toHaveLength(4);expect(cardiologyPathways.every(p=>p.steps.length===4)).toBe(true)});
});
