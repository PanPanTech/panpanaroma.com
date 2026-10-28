export const statuses=['new','quoted','sample_sent','ordered','closed'] as const;
export const inquiryKinds=['quote','sample','documents','contact'] as const;
export type InquiryInput={kind:string;name:string;company:string;email:string;country:string;product:string;quantity:string;packaging:string;customization:string;timeline:string;message:string;source:string;consent:boolean;website?:string};
export function validateInquiry(value:unknown):{data?:InquiryInput;errors:Record<string,string>}{
 const errors:Record<string,string>={};if(!value||typeof value!=='object'||Array.isArray(value))return {errors:{form:'Please send a valid request.'}};
 const v=value as Record<string,unknown>;const text=(key:string,max=500)=>{const raw=v[key];if(raw!=null&&typeof raw!=='string')errors[key]='Please enter text.';const result=typeof raw==='string'?raw.trim():'';if(result.length>max)errors[key]=`Please use ${max} characters or fewer.`;return result;};
 const data:InquiryInput={kind:text('kind',20),name:text('name',100),company:text('company',150),email:text('email',254),country:text('country',100),product:text('product',250),quantity:text('quantity',100),packaging:text('packaging',250),customization:text('customization',500),timeline:text('timeline',150),message:text('message',3000),source:text('source',500),consent:v.consent===true,website:text('website',200)};
 if(!(inquiryKinds as readonly string[]).includes(data.kind))errors.kind='Please choose a request type.';
 for(const key of (data.kind==='contact'?['name','email','message']:['name','company','email','country','product','quantity']) as (keyof InquiryInput)[])if(!data[key])errors[key]='This field is required.';
 if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))errors.email='Please enter a valid email address.';
 if(!data.consent)errors.consent='Please agree to the privacy notice to send your request.';
 if(data.kind==='contact'){data.product=data.product||'General enquiry';data.quantity='Not applicable';}
 if(data.source&&!data.source.startsWith('/'))data.source='/';return {data,errors};
}
export function safeCsvCell(value:unknown){const s=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
export function sameOrigin(request:Request){const incoming=request.headers.get('origin');return !incoming||incoming===new URL(request.url).origin;}
