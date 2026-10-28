import {Leaf} from 'lucide-react';
import {aromaFamilies,aromaLabel} from '@/lib/aroma';
export default function AromaArt({name,family}:{name:string;family?:string}){
 const profile=aromaFamilies.find(f=>f.id===family);
 return <div className="aroma-art" style={{'--aroma-color':profile?.color||'#a4af97'} as React.CSSProperties} role="img" aria-label={`${name}: botanical profile illustration, not a product photograph`}><span className="aroma-art-top">BOTANICAL PROFILE</span><span className="aroma-disc"><Leaf size={74} strokeWidth={.65}/></span><span className="aroma-art-family">{aromaLabel(family)}</span><span className="aroma-art-caption">Illustration · sample to confirm</span></div>;
}
